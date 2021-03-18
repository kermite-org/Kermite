#include "splitKeyboard.h"
#include "bitOperations.h"
#include "config.h"
#include "configValidator.h"
#include "configuratorServant.h"
#include "debugUart.h"
#include "dio.h"
#include "keyMatrixScanner.h"
#include "keyboardCoreLogic2.h"
#include "singlewire3.h"
#include "system.h"
#include "usbioCore.h"
#include "utils.h"
#include "versions.h"
#include <stdio.h>

//---------------------------------------------
//definitions

#ifndef KM0_NUM_KEYSLOTS
#error KM0_NUM_KEYSLOTS is not defined
#endif

#define NumKeySlots KM0_NUM_KEYSLOTS
#define NumKeySlotsHalf (KM0_NUM_KEYSLOTS >> 1)

//#define NumKeySlotBytesHalf Ceil(NumKeySlotsHalf / 8)
#define NumKeySlotBytesHalf ((NumKeySlotsHalf + 7) >> 3)
#define NumKeySlotBytes (NumKeySlotBytesHalf * 2)

#define SingleWireMaxPacketSize (NumKeySlotBytesHalf + 1)

//---------------------------------------------
//variables

static uint8_t numRows = 0;
static uint8_t numColumns = 0;
static uint8_t *rowPins;
static uint8_t *columnPins;
static uint8_t *keySlotIndexToKeyIndexMap;

//左右間通信用バッファ
static uint8_t sw_txbuf[SingleWireMaxPacketSize] = { 0 };
static uint8_t sw_rxbuf[SingleWireMaxPacketSize] = { 0 };

//キー状態
static uint8_t keyStateFlags[NumKeySlotBytes] = { 0 };
static uint8_t nextKeyStateFlags[NumKeySlotBytes] = { 0 };

static uint8_t pressedKeyCount = 0;

static uint16_t localLayerFlags = 0;
static uint8_t localHidReport[8] = { 0 };

//メインロジックをPC側ユーティリティのLogicSimulatorに移譲するモード
static bool isSideBrainModeEnabled = false;

static bool hasMasterOathReceived = false;
static bool debugUartConfigured = false;

//---------------------------------------------
//動的に変更可能なオプション
static bool optionEmitKeyStroke = true;
static bool optionEmitRealtimeEvents = true;
static bool optionAffectKeyHoldStateToLED = true;
static bool optionUseHeartbeatLED = true;
static bool optionInvertSide = false;

static uint8_t optionDynamicFlags = 0xFF;

static bool optionsInitialConfigShutup = false;

static void customParameterValueHandler(uint8_t slotIndex, uint8_t value) {
  if (optionsInitialConfigShutup && bit_read(optionDynamicFlags, slotIndex) == 0) {
    return;
  }
  if (slotIndex == OptionSlot_EmitKeyStroke) {
    optionEmitKeyStroke = !!value;
  } else if (slotIndex == OptionSlot_EmitRealtimeEvents) {
    optionEmitRealtimeEvents = !!value;
  } else if (slotIndex == OptionSlot_AffectKeyHoldStateToLED) {
    optionAffectKeyHoldStateToLED = !!value;
  } else if (slotIndex == OptionSlot_UseHeartBeatLED) {
    optionUseHeartbeatLED = !!value;
  } else if (slotIndex == OptionSlot_MasterSide) {
    //value: (1:left, 2:right)
    optionInvertSide = value == 2;
  }
}

void setCustomParameterDynamicFlag(uint8_t slotIndex, bool isDynamic) {
  bit_spec(optionDynamicFlags, slotIndex, isDynamic);
}

//---------------------------------------------
//board io

static int8_t led_pin1 = -1;
static int8_t led_pin2 = -1;
static bool led_invert = false;

static void outputLED1(bool val) {
  if (led_pin1 != -1) {
    dio_write(led_pin1, led_invert ? !val : val);
  }
}

static void outputLED2(bool val) {
  if (led_pin2 != -1) {
    dio_write(led_pin2, led_invert ? !val : val);
  }
}

static void initBoardLEDs(uint8_t pin1, uint8_t pin2, bool invert) {
  led_pin1 = pin1;
  led_pin2 = pin2;
  led_invert = invert;
  if (led_pin1 != -1) {
    dio_setOutput(led_pin1);
    dio_write(led_pin1, invert);
  }
  if (led_pin2 != -1) {
    dio_setOutput(led_pin2);
    dio_write(led_pin2, invert);
  }
}
//---------------------------------------------

static void debugDumpLocalOutputState() {
  printf("HID report:[");
  for (uint16_t i = 0; i < 8; i++) {
    printf("%02X ", localHidReport[i]);
  }
  printf("], ");
  printf("layers: %02X\n", localLayerFlags);
}

//ロジック結果出力処理
static void processKeyboardCoreLogicOutput() {
  uint16_t layerFlags = keyboardCoreLogic_getLayerActiveFlags();
  uint8_t *hidReport = keyboardCoreLogic_getOutputHidReportBytes();

  bool changed = false;
  if (layerFlags != localLayerFlags) {
    if (optionEmitRealtimeEvents) {
      configuratorServant_emitRelatimeLayerEvent(layerFlags);
    }
    localLayerFlags = layerFlags;
    changed = true;
  }
  if (!utils_compareBytes(hidReport, localHidReport, 8)) {
    if (optionEmitKeyStroke) {
      usbioCore_hidKeyboard_writeReport(hidReport);
    }
    utils_copyBytes(localHidReport, hidReport, 8);
    changed = true;
  }
  if (changed) {
    debugDumpLocalOutputState();
  }

  uint16_t assignHitResult = keyboardCoreLogic_peekAssignHitResult();
  if (assignHitResult != 0 && optionEmitRealtimeEvents) {
    configuratorServant_emitRelatimeAssignHitEvent(assignHitResult);
  }
}

//キーが押された/離されたときに呼ばれるハンドラ, 両手用
static void onPhysicalKeyStateChanged(uint8_t keySlotIndex, bool isDown) {
  if (keySlotIndex >= NumKeySlots) {
    return;
  }
  uint8_t keyIndex = system_readRomByte(keySlotIndexToKeyIndexMap + keySlotIndex);
  if (keyIndex == 0xFF) {
    return;
  }
  if (isDown) {
    printf("keydown %d\n", keyIndex);
    pressedKeyCount++;
  } else {
    printf("keyup %d\n", keyIndex);
    pressedKeyCount--;
  }

  //ユーティリティにキー状態変化イベントを送信
  if (optionEmitRealtimeEvents) {
    configuratorServant_emitRealtimeKeyEvent(keyIndex, isDown);
  }

  if (!isSideBrainModeEnabled) {
    //メインロジックでキー入力を処理
    keyboardCoreLogic_issuePhysicalKeyStateChanged(keyIndex, isDown);
  }
}

static void resetKeyboardCoreLogic() {
  bool configMemoryValid = configValidator_checkDataHeader();
  if (configMemoryValid) {
    keyboardCoreLogic_initialize();
  } else {
    keyboardCoreLogic_halt();
  }
}

//ユーティリティによる設定書き込み時に呼ばれるハンドラ
static void configuratorServantStateHandler(uint8_t state) {
  if (state == ConfiguratorServantState_KeyMemoryUpdationStarted) {
    keyboardCoreLogic_halt();
  }
  if (state == ConfiguratorServentState_KeyMemoryUpdationDone) {
    resetKeyboardCoreLogic();
  }
  if (state == ConfiguratorServentState_SideBrainModeEnabled) {
    isSideBrainModeEnabled = true;
  }
  if (state == ConfiguratorServentState_SideBrainModeDisabled) {
    isSideBrainModeEnabled = false;
  }
}

//---------------------------------------------
//master

//反対側のコントローラからキー状態を受け取る処理
static void pullAltSideKeyStates() {
  system_disableInterrupts();
  sw_txbuf[0] = 0x40;
  singlewire_sendFrame(sw_txbuf, 1); //キー状態要求パケットを送信

  uint8_t sz = singlewire_receiveFrame(sw_rxbuf, SingleWireMaxPacketSize);
  system_enableInterrupts();

  if (sz > 0) {

    uint8_t cmd = sw_rxbuf[0];
    if (cmd == 0x41 && sz == 1 + NumKeySlotBytesHalf) {
      uint8_t *payloadBytes = sw_rxbuf + 1;
      //子-->親, キー状態応答パケット受信, 子のキー状態を受け取り保持
      utils_copyBitFlagsBuf(nextKeyStateFlags, NumKeySlotsHalf, payloadBytes, 0, NumKeySlotsHalf);
    }
  }
}

//キー状態更新処理
static void processKeyStatesUpdate() {
  for (uint8_t i = 0; i < NumKeySlotBytes; i++) {
    uint8_t byte0 = keyStateFlags[i];
    uint8_t byte1 = nextKeyStateFlags[i];
    for (uint8_t j = 0; j < 8; j++) {
      uint8_t keySlotIndex = i * 8 + j;
      if (keySlotIndex >= NumKeySlots) {
        break;
      }
      if (optionInvertSide) {
        keySlotIndex = (keySlotIndex < NumKeySlotsHalf)
                           ? (NumKeySlotsHalf + keySlotIndex)
                           : (keySlotIndex - NumKeySlotsHalf);
      }
      bool state0 = bit_read(byte0, j);
      bool state1 = bit_read(byte1, j);
      if (!state0 && state1) {
        onPhysicalKeyStateChanged(keySlotIndex, true);
      }
      if (state0 && !state1) {
        onPhysicalKeyStateChanged(keySlotIndex, false);
      }
    }
    keyStateFlags[i] = nextKeyStateFlags[i];
  }
}

static void runAsMaster() {
  keyMatrixScanner_initialize(
      numRows, numColumns, rowPins, columnPins, nextKeyStateFlags);

  resetKeyboardCoreLogic();

  configuratorServant_initialize(
      configuratorServantStateHandler, customParameterValueHandler);

  uint16_t cnt = 0;
  while (1) {
    cnt++;
    if (cnt % 4 == 0) {
      keyMatrixScanner_update();
      processKeyStatesUpdate();
      keyboardCoreLogic_processTicker(5);
      processKeyboardCoreLogicOutput();
      if (optionAffectKeyHoldStateToLED) {
        outputLED2(pressedKeyCount > 0);
      }
    }
    if (cnt % 4 == 2) {
      pullAltSideKeyStates();
    }
    if (optionUseHeartbeatLED) {
      if (cnt % 2000 == 0) {
        outputLED1(true);
      }
      if (cnt % 2000 == 1) {
        outputLED1(false);
      }
    }
    delayMs(1);
    usbioCore_processUpdate();
    configuratorServant_processUpdate();
  }
}

//---------------------------------------------
//slave

//子から親に対してキー状態応答パケットを送る
static void sendKeyStateResponsePacketToMaster() {
  sw_txbuf[0] = 0x41;
  utils_copyBytes(sw_txbuf + 1, nextKeyStateFlags, NumKeySlotBytesHalf);
  singlewire_sendFrame(sw_txbuf, 1 + NumKeySlotBytesHalf);
}

//単線通信の受信割り込みコールバック
static void onRecevierInterruption() {
  uint8_t sz = singlewire_receiveFrame(sw_rxbuf, SingleWireMaxPacketSize);
  if (sz > 0) {
    uint8_t cmd = sw_rxbuf[0];
    if (cmd == 0x40 && sz == 1) {
      //親-->子, キー状態要求パケット受信, キー状態応答パケットを返す
      sendKeyStateResponsePacketToMaster();
    }
  }
}

static bool checkIfSomeKeyPressed() {
  for (uint8_t i = 0; i < NumKeySlotBytesHalf; i++) {
    if (nextKeyStateFlags[i] > 0) {
      return true;
    }
  }
  return false;
}

static void runAsSlave() {
  keyMatrixScanner_initialize(
      numRows, numColumns, rowPins, columnPins, nextKeyStateFlags);
  singlewire_setupInterruptedReceiver(onRecevierInterruption);

  uint16_t cnt = 0;
  while (1) {
    cnt++;
    if (cnt % 4 == 0) {
      keyMatrixScanner_update();
      pressedKeyCount = checkIfSomeKeyPressed();
      if (optionAffectKeyHoldStateToLED) {
        outputLED2(pressedKeyCount > 0);
      }
    }
    if (optionUseHeartbeatLED) {
      if (cnt % 4000 == 0) {
        outputLED1(true);
      }
      if (cnt % 4000 == 1) {
        outputLED1(false);
      }
    }
    delayMs(1);
  }
}

//---------------------------------------------
//detection

//単線通信受信割り込みコールバック
static void masterSlaveDetectionMode_onRecevierInterruption() {
  uint8_t sz = singlewire_receiveFrame(sw_rxbuf, SingleWireMaxPacketSize);
  if (sz > 0) {
    uint8_t cmd = sw_rxbuf[0];
    if (cmd == 0xA0 && sz == 1) {
      //親-->子, Master確定通知パケット受信
      hasMasterOathReceived = true;
    }
  }
}

//USB接続が確立していない期間の動作
//双方待機し、USB接続が確立すると自分がMasterになり、相手にMaseter確定通知パケットを送る
static bool runMasterSlaveDetectionMode() {
  singlewire_initialize();
  singlewire_setupInterruptedReceiver(masterSlaveDetectionMode_onRecevierInterruption);

  system_enableInterrupts();

  while (true) {
    if (usbioCore_isConnectedToHost()) {
      singlewire_clearInterruptedReceiver();
      sw_txbuf[0] = 0xA0;
      singlewire_sendFrame(sw_txbuf, 1); //Master確定通知パケットを送信
      return true;
    }
    if (hasMasterOathReceived) {
      return false;
    }
    delayMs(1);
  }
}

//---------------------------------------------

//master/slave確定後にどちらになったかをLEDで表示
static void showModeByLedBlinkPattern(bool isMaster) {
  if (isMaster) {
    //masterの場合高速に4回点滅
    for (uint8_t i = 0; i < 4; i++) {
      outputLED1(true);
      delayMs(2);
      outputLED1(false);
      delayMs(100);
    }
  } else {
    //slaveの場合長く1回点灯
    outputLED1(true);
    delayMs(500);
    outputLED1(false);
  }
}

//---------------------------------------------

void splitKeyboard_useIndicatorLEDs(int8_t pin1, int8_t pin2, bool invert) {
  initBoardLEDs(pin1, pin2, invert);
}

void splitKeyboard_useDebugUART(uint16_t baud) {
  debugUart_setup(baud);
  debugUartConfigured = true;
}

void splitKeyboard_useOptionFixed(uint8_t slot, uint8_t value) {
  customParameterValueHandler(slot, value);
  setCustomParameterDynamicFlag(slot, false);
}

void splitKeyboard_useOptionDynamic(uint8_t slot) {
  setCustomParameterDynamicFlag(slot, true);
}

void splitKeyboard_setup(
    uint8_t _numRows, uint8_t _numColumns,
    const uint8_t *_rowPins, const uint8_t *_columnPins,
    const int8_t *_keySlotIndexToKeyIndexMap) {
  numRows = _numRows;
  numColumns = _numColumns;
  rowPins = (uint8_t *)_rowPins;
  columnPins = (uint8_t *)_columnPins;
  keySlotIndexToKeyIndexMap = (uint8_t *)_keySlotIndexToKeyIndexMap;
}

static uint8_t serialNumberTextBuf[24];

void splitKeyboard_start() {
  system_initializeUserProgram();
  optionsInitialConfigShutup = true;
  if (!debugUartConfigured) {
    debugUart_disable();
  }
  printf("start\n");
  configValidator_initializeDataStorage();
  utils_copyBytes(serialNumberTextBuf, (uint8_t *)KERMITE_MCU_CODE, 8);
  utils_copyBytes(serialNumberTextBuf + 8, (uint8_t *)PROJECT_ID, 8);
  configuratorServant_readDeviceInstanceCode(serialNumberTextBuf + 16);
  uibioCore_internal_setSerialNumberText(serialNumberTextBuf, 24);
  usbioCore_initialize();
  bool isMaster = runMasterSlaveDetectionMode();
  printf("isMaster:%d\n", isMaster);
  showModeByLedBlinkPattern(isMaster);
  if (isMaster) {
    runAsMaster();
  } else {
    runAsSlave();
  }
}
