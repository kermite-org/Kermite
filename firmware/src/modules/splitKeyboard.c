#include "splitKeyboard.h"
#include "bitOperations.h"
#include "config.h"
#include "configValidator.h"
#include "configuratorServant.h"
#include "debugUart.h"
#include "keyMatrixScanner2.h"
#include "keyboardCoreLogic2.h"
#include "pio.h"
#include "singlewire3.h"
#include "usbioCore.h"
#include "utils.h"
#include <avr/interrupt.h>
#include <avr/io.h>
#include <avr/pgmspace.h>
#include <stdio.h>
#include <util/delay.h>

#ifndef SK_NUM_ROWS
#error SK_NUM_ROWS is not defined
#endif

#ifndef SK_NUM_COLUMNS
#error SK_NUM_COLUMNS is not defined
#endif

//---------------------------------------------
//definitions

#define NumRows SK_NUM_ROWS
#define NumColumns SK_NUM_COLUMNS

#define NumKeySlots (NumRows * NumColumns * 2)
#define NumKeySlotsHalf (NumRows * NumColumns)

//#define NumKeySlotBytesHalf Ceil(NumRows * NumColumns / 8)
#define NumKeySlotBytesHalf ((NumRows * NumColumns + 7) >> 3)
#define NumKeySlotBytes (NumKeySlotBytesHalf * 2)

#define SingleWireMaxPacketSize (NumKeySlotBytesHalf + 1)

//---------------------------------------------
//variables

static uint8_t *rowPins;
static uint8_t *columnPins;
static uint8_t *keySlotIndexToKeyIndexMap;

//左右間通信用バッファ
static uint8_t sw_txbuf[SingleWireMaxPacketSize];
static uint8_t sw_rxbuf[SingleWireMaxPacketSize];

//キー状態
static uint8_t keyStateFlags[NumKeySlotBytes] = { 0 };
static uint8_t nextKeyStateFlags[NumKeySlotBytes] = { 0 };

static uint8_t pressedKeyCount = 0;

static uint16_t localLayerFlags = 0;
static uint8_t localHidReport[8] = { 0 };

//メインロジックをPC側ユーティリティのLogicSimulatorに移譲するモード
static bool isSideBrainModeEnabled = false;

static bool hasMasterOathReceived = false;
static bool useBoardLeds = false;

//---------------------------------------------
//board io

#define PIN_LED0 P_D5 //TXLED on ProMicro
#define PIN_LED1 P_B0 //RXLED on ProMicro

static void outputLED0(bool val) {
  if (useBoardLeds) {
    pio_output(PIN_LED0, !val);
  }
}

static void outputLED1(bool val) {
  if (useBoardLeds) {
    pio_output(PIN_LED1, !val);
  }
}

static void initBoardLeds() {
  useBoardLeds = true;
  pio_setOutput(PIN_LED0);
  pio_setOutput(PIN_LED1);
  outputLED0(false);
  outputLED1(false);
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
    configuratorServant_emitRelatimeLayerEvent(layerFlags);
    localLayerFlags = layerFlags;
    changed = true;
  }
  if (!utils_compareBytes(hidReport, localHidReport, 8)) {
    usbioCore_hidKeyboard_writeReport(hidReport);
    utils_copyBytes(localHidReport, hidReport, 8);
    changed = true;
  }
  if (changed) {
    debugDumpLocalOutputState();
  }

  uint16_t assignHitResult = keyboardCoreLogic_peekAssignHitResult();
  if (assignHitResult != 0) {
    configuratorServant_emitRelatimeAssignHitEvent(assignHitResult);
  }
}

//キーが押された/離されたときに呼ばれるハンドラ, 両手用
static void onPhysicalKeyStateChanged(uint8_t keySlotIndex, bool isDown) {
  if (keySlotIndex >= NumKeySlots) {
    return;
  }
  uint8_t keyIndex = pgm_read_byte(keySlotIndexToKeyIndexMap + keySlotIndex);
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
  configuratorServant_emitRealtimeKeyEvent(keyIndex, isDown);

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
  cli();
  sw_txbuf[0] = 0x40;
  singlewire_sendFrame(sw_txbuf, 1); //キー状態要求パケットを送信

  uint8_t sz = singlewire_receiveFrame(sw_rxbuf, SingleWireMaxPacketSize);
  sei();
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
      NumRows, NumColumns, rowPins, columnPins, nextKeyStateFlags);

  resetKeyboardCoreLogic();

  configuratorServant_initialize(configuratorServantStateHandler);

  uint16_t cnt = 0;
  while (1) {
    cnt++;
    if (cnt % 4 == 0) {
      keyMatrixScanner_update();
      processKeyStatesUpdate();
      keyboardCoreLogic_processTicker(5);
      processKeyboardCoreLogicOutput();
      outputLED1(pressedKeyCount > 0);
    }
    if (cnt % 4 == 2) {
      pullAltSideKeyStates();
    }
    if (cnt % 2000 == 0) {
      outputLED0(true);
    }
    if (cnt % 2000 == 1) {
      outputLED0(false);
    }
    _delay_ms(1);
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
      NumRows, NumColumns, rowPins, columnPins, nextKeyStateFlags);
  singlewire_setupInterruptedReceiver(onRecevierInterruption);

  uint16_t cnt = 0;
  while (1) {
    cnt++;
    if (cnt % 4 == 0) {
      keyMatrixScanner_update();
      pressedKeyCount = checkIfSomeKeyPressed();
      outputLED1(pressedKeyCount > 0);
    }
    if (cnt % 4000 == 0) {
      outputLED0(true);
    }
    if (cnt % 4000 == 1) {
      outputLED0(false);
    }

    _delay_ms(1);
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
  sei();
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
    _delay_ms(1);
  }
}

//---------------------------------------------

//master/slave確定後にどちらになったかをLEDで表示
static void showModeByLedBlinkPattern(bool isMaster) {
  if (isMaster) {
    //masterの場合高速に4回点滅
    for (uint8_t i = 0; i < 4; i++) {
      outputLED0(true);
      outputLED1(true);
      _delay_ms(2);
      outputLED0(false);
      outputLED1(false);
      _delay_ms(100);
    }
  } else {
    //slaveの場合長く1回点灯
    outputLED0(true);
    outputLED1(true);
    _delay_ms(500);
    outputLED0(false);
    outputLED1(false);
  }
}

//---------------------------------------------

void splitKeyboard_setup(
    const uint8_t *_rowPins, const uint8_t *_columnPins, const int8_t *_keySlotIndexToKeyIndexMap) {
  rowPins = (uint8_t *)_rowPins;
  columnPins = (uint8_t *)_columnPins;
  keySlotIndexToKeyIndexMap = (int8_t *)_keySlotIndexToKeyIndexMap;
}

void splitKeyboard_useOnboardLeds() {
  initBoardLeds();
}

void splitKeyboard_useDebugUART(uint16_t baud) {
  debugUart_setup(baud);
}

void splitKeyboard_start() {
  USBCON = 0;
  printf("start\n");
  configValidator_initializeEEPROM();
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
