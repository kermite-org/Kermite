#include "splitKeyboard.h"
#include "config.h"
#include "configValidator.h"
#include "configuratorServant.h"
#include "keyboardCoreLogic.h"
#include "km0/common/bitOperations.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/boardSync.h"
#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/dio.h"
#include "km0/deviceIo/system.h"
#include "km0/deviceIo/usbIoCore.h"
#include "versions.h"
#include <stdio.h>

//---------------------------------------------
//definitions

#ifndef KM0_KEYBOARD__NUM_SCAN_SLOTS
#error KM0_KEYBOARD__NUM_SCAN_SLOTS is not defined
#endif

#define NumScanSlots KM0_KEYBOARD__NUM_SCAN_SLOTS
#define NumScanSlotsHalf (KM0_KEYBOARD__NUM_SCAN_SLOTS >> 1)

//#define NumScanSlotBytesHalf Ceil(NumScanSlotsHalf / 8)
#define NumScanSlotBytesHalf ((NumScanSlotsHalf + 7) >> 3)
#define NumScanSlotBytes (NumScanSlotBytesHalf * 2)

#define SingleWireMaxPacketSize (NumScanSlotBytesHalf + 1)

//---------------------------------------------
//variables

static uint8_t *scanIndexToKeyIndexMap;

//左右間通信用バッファ
static uint8_t sw_txbuf[SingleWireMaxPacketSize] = { 0 };
static uint8_t sw_rxbuf[SingleWireMaxPacketSize] = { 0 };

//キー状態
static uint8_t keyStateFlags[NumScanSlotBytes] = { 0 };
static uint8_t nextKeyStateFlags[NumScanSlotBytes] = { 0 };

static uint8_t pressedKeyCount = 0;

static uint16_t localLayerFlags = 0;
static uint8_t localHidReport[8] = { 0 };

//メインロジックをPC側ユーティリティのLogicSimulatorに移譲するモード
static bool isSideBrainModeEnabled = false;

static bool hasMasterOathReceived = false;
static bool debugUartConfigured = false;

static void (*keyScannerUpdateFunc)(uint8_t *keyStateBitFlags) = 0;

//---------------------------------------------
//動的に変更可能なオプション
static bool optionEmitKeyStroke = true;
static bool optionEmitRealtimeEvents = true;
static bool optionAffectKeyHoldStateToLed = true;
static bool optionUseHeartbeatLed = true;
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
  } else if (slotIndex == OptionSlot_AffectKeyHoldStateToLed) {
    optionAffectKeyHoldStateToLed = !!value;
  } else if (slotIndex == OptionSlot_UseHeartBeatLed) {
    optionUseHeartbeatLed = !!value;
  } else if (slotIndex == OptionSlot_MasterSide) {
    //value: (1:left, 2:right)
    optionInvertSide = value == 2;
  }
}

void setCustomParameterDynamicFlag(uint8_t slotIndex, bool isDynamic) {
  bit_spec(optionDynamicFlags, slotIndex, isDynamic);
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
      usbIoCore_hidKeyboard_writeReport(hidReport);
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
static void onPhysicalKeyStateChanged(uint8_t scanIndex, bool isDown) {
  if (scanIndex >= NumScanSlots) {
    return;
  }
  uint8_t keyIndex = scanIndexToKeyIndexMap[scanIndex];
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
  sw_txbuf[0] = 0x40;
  boardSync_writeTxFrame(sw_txbuf, 1); //キー状態要求パケットを送信
  boardSync_exchangeFramesBlocking();
  uint8_t sz = boardSync_readRxFrame(sw_rxbuf, SingleWireMaxPacketSize);

  if (sz > 0) {
    uint8_t cmd = sw_rxbuf[0];
    if (cmd == 0x41 && sz == 1 + NumScanSlotBytesHalf) {
      uint8_t *payloadBytes = sw_rxbuf + 1;
      //子-->親, キー状態応答パケット受信, 子のキー状態を受け取り保持
      utils_copyBitFlagsBuf(nextKeyStateFlags, NumScanSlotsHalf, payloadBytes, 0, NumScanSlotsHalf);
    }
  }
}

//キー状態更新処理
static void processKeyStatesUpdate() {
  for (uint8_t i = 0; i < NumScanSlotBytes; i++) {
    uint8_t byte0 = keyStateFlags[i];
    uint8_t byte1 = nextKeyStateFlags[i];
    for (uint8_t j = 0; j < 8; j++) {
      uint8_t scanIndex = i * 8 + j;
      if (scanIndex >= NumScanSlots) {
        break;
      }
      if (optionInvertSide) {
        scanIndex = (scanIndex < NumScanSlotsHalf)
                        ? (NumScanSlotsHalf + scanIndex)
                        : (scanIndex - NumScanSlotsHalf);
      }
      bool state0 = bit_read(byte0, j);
      bool state1 = bit_read(byte1, j);
      if (!state0 && state1) {
        onPhysicalKeyStateChanged(scanIndex, true);
      }
      if (state0 && !state1) {
        onPhysicalKeyStateChanged(scanIndex, false);
      }
    }
    keyStateFlags[i] = nextKeyStateFlags[i];
  }
}

static void runAsMaster() {
  resetKeyboardCoreLogic();

  configuratorServant_initialize(
      configuratorServantStateHandler, customParameterValueHandler);

  uint16_t cnt = 0;
  while (1) {
    cnt++;
    if (cnt % 4 == 0) {
      keyScannerUpdateFunc(nextKeyStateFlags);
      processKeyStatesUpdate();
      keyboardCoreLogic_processTicker(5);
      processKeyboardCoreLogicOutput();
      if (optionAffectKeyHoldStateToLed) {
        boardIo_writeLed2(pressedKeyCount > 0);
      }
    }
    if (cnt % 4 == 2) {
      pullAltSideKeyStates();
    }
    if (optionUseHeartbeatLed) {
      if (cnt % 2000 == 0) {
        boardIo_writeLed1(true);
      }
      if (cnt % 2000 == 4) {
        boardIo_writeLed1(false);
      }
    }
    delayMs(1);
    usbIoCore_processUpdate();
    configuratorServant_processUpdate();
  }
}

//---------------------------------------------
//slave

//単線通信の受信割り込みコールバック
static void onRecevierInterruption() {
  uint8_t sz = boardSync_readRxFrame(sw_rxbuf, SingleWireMaxPacketSize);
  if (sz > 0) {
    uint8_t cmd = sw_rxbuf[0];
    if (cmd == 0x40 && sz == 1) {
      //親-->子, キー状態要求パケット受信, キー状態応答パケットを返す
      //子から親に対してキー状態応答パケットを送る
      sw_txbuf[0] = 0x41;
      utils_copyBytes(sw_txbuf + 1, nextKeyStateFlags, NumScanSlotBytesHalf);
      boardSync_writeTxFrame(sw_txbuf, 1 + NumScanSlotBytesHalf);
    }
  }
}

static bool checkIfSomeKeyPressed() {
  for (uint8_t i = 0; i < NumScanSlotBytesHalf; i++) {
    if (nextKeyStateFlags[i] > 0) {
      return true;
    }
  }
  return false;
}

static void runAsSlave() {
  boardSync_setupSlaveReceiver(onRecevierInterruption);

  uint16_t cnt = 0;
  while (1) {
    cnt++;
    if (cnt % 4 == 0) {
      keyScannerUpdateFunc(nextKeyStateFlags);
      pressedKeyCount = checkIfSomeKeyPressed();
      if (optionAffectKeyHoldStateToLed) {
        boardIo_writeLed2(pressedKeyCount > 0);
      }
    }
    if (optionUseHeartbeatLed) {
      if (cnt % 4000 == 0) {
        boardIo_writeLed1(true);
      }
      if (cnt % 4000 == 4) {
        boardIo_writeLed1(false);
      }
    }
    delayMs(1);
  }
}

//---------------------------------------------
//detection

//単線通信受信割り込みコールバック
static void masterSlaveDetectionMode_onRecevierInterruption() {
  uint8_t sz = boardSync_readRxFrame(sw_rxbuf, SingleWireMaxPacketSize);
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
  boardSync_initialize();
  boardSync_setupSlaveReceiver(masterSlaveDetectionMode_onRecevierInterruption);

  system_enableInterrupts();

  while (true) {
    if (usbIoCore_isConnectedToHost()) {
      boardSync_clearSlaveReceiver();
      sw_txbuf[0] = 0xA0;
      boardSync_writeTxFrame(sw_txbuf, 1); //Master確定通知パケットを送信
      boardSync_exchangeFramesBlocking();
      return true;
    }
    if (hasMasterOathReceived) {
      boardSync_clearSlaveReceiver();
      return false;
    }
    usbIoCore_processUpdate();
    delayMs(1);
  }
}

//---------------------------------------------

//master/slave確定後にどちらになったかをLEDで表示
static void showModeByLedBlinkPattern(bool isMaster) {
  if (isMaster) {
    //masterの場合高速に4回点滅
    for (uint8_t i = 0; i < 4; i++) {
      boardIo_writeLed1(true);
      delayMs(2);
      boardIo_writeLed1(false);
      delayMs(100);
    }
  } else {
    //slaveの場合長く1回点灯
    boardIo_writeLed1(true);
    delayMs(500);
    boardIo_writeLed1(false);
  }
}

//---------------------------------------------

void splitKeyboard_useIndicatorLeds(int8_t pin1, int8_t pin2, bool invert) {
  boardIo_setupLeds(pin1, pin2, invert);
}

void splitKeyboard_useIndicatorRgbLed(int8_t pin) {
  boardIo_setupLedsRgb(pin);
}

void splitKeyboard_useDebugUart(uint32_t baud) {
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

void splitKeyboard_useKeyScanner(void (*_keyScannerUpdateFunc)(uint8_t *keyStateBitFlags)) {
  keyScannerUpdateFunc = _keyScannerUpdateFunc;
}

void splitKeyboard_setKeyIndexTable(const int8_t *_scanIndexToKeyIndexMap) {
  scanIndexToKeyIndexMap = (uint8_t *)_scanIndexToKeyIndexMap;
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
  usbIoCore_initialize();
  bool isMaster = runMasterSlaveDetectionMode();
  printf("isMaster:%d\n", isMaster);
  showModeByLedBlinkPattern(isMaster);
  if (isMaster) {
    runAsMaster();
  } else {
    runAsSlave();
  }
}
