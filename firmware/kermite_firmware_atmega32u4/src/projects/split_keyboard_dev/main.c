#include "ConfigurationMemoryReader.h"
#include "KeyMatrixScanner2.h"
#include "bit_operations.h"
#include "configuratorServant.h"
#include "debug_uart.h"
#include "generalUtils.h"
#include "keyboardCoreLogic.h"
#include "pio.h"
#include "singlewire3.h"
#include "usbiocore.h"
#include <avr/interrupt.h>
#include <avr/io.h>
#include <avr/pgmspace.h>
#include <stdio.h>
#include <util/delay.h>

//---------------------------------------------
//board io

#define pin_LED0 P_D5 //TXLED on ProMicro
#define pin_LED1 P_B0 //RXLED on ProMicro

void initBoardIo() {
  pio_setOutput(pin_LED0);
  pio_setOutput(pin_LED1);
}

void outputLED0(bool val) {
  pio_output(pin_LED0, !val);
}

void toggleLED0() {
  pio_toggleOutput(pin_LED0);
}

void outputLED1(bool val) {
  pio_output(pin_LED1, !val);
}

void toggleLED1() {
  pio_toggleOutput(pin_LED1);
}

//---------------------------------------------
//definitions

#if 0

#define NumRows 4
#define NumColumns 6

static const uint8_t rowPins[NumRows] = { P_D7, P_E6, P_B4, P_B5 };
static const uint8_t columnPins[NumColumns] = { P_F6, P_F7, P_B1, P_B3, P_B2, P_B6 };

#define NumKeySlots 48
#define NumKeySlotsHalf 24 //NumRows * NumColumns

#define NumKeySlotBytes 6
#define NumKeySlotBytesHalf 3 //Ceil(NumRows * NumColumns / 8);

#define NumPhysicalKeys 48

// clang-format off
static const int8_t keySlotIndexToKeyIndexMap[NumKeySlots] PROGMEM = {
  //left
  5, 4, 3, 2, 1, 0,
  11, 10, 9, 8, 7, 6,
  17, 16, 15, 14, 13, 12,
  23, 22, 21, 20, 19, 18,
  //right
  29, 28, 27, 26, 25, 24,
  35, 34, 33, 32, 31, 30,
  41, 40, 39, 38, 37, 36,
  47, 46, 45, 44, 43, 42,
};
// clang-format on

#define SingleWireMaxPacketSize 6

#endif

#if 1

#define NumRows 5
#define NumColumns 6

static const uint8_t rowPins[NumRows] = { P_C6, P_D7, P_E6, P_B4, P_B5 };
static const uint8_t columnPins[NumColumns] = { P_F6, P_F7, P_B1, P_B3, P_B2, P_B6 };

#define NumKeySlots 60
#define NumKeySlotsHalf 30 //NumRows * NumColumns

#define NumKeySlotBytes 8
#define NumKeySlotBytesHalf 4 //Ceil(NumRows * NumColumns / 8);

#define SingleWireMaxPacketSize 6 //NumKeySlotBytesHalf + 2

#define KeyIndexRange 48

#define xx -1

// clang-format off
static const int8_t keySlotIndexToKeyIndexMap[NumKeySlots] PROGMEM = {
  //left
  xx, xx, xx, xx, xx, xx,
  5, 4, 3, 2, 1, 0,
  11, 10, 9, 8, 7, 6,
  17, 16, 15, 14, 13, 12,
  xx, 21, 20, 19, 18, 23,
  //right
  xx, xx, xx, xx, xx, xx,
  29, 28, 27, 26, 25, 24,
  35, 34, 33, 32, 31, 30,
  41, 40, 39, 38, 37, 36,
  xx, 45, 44, 43, 42, 47,
};
// clang-format on

#endif

const bool EmitHidKeys = true;
//const bool EmitHidKeys = false;

//---------------------------------------------
//variables

uint8_t pressedKeyCount = 0;

//左右間通信用バッファ
uint8_t sw_txbuf[SingleWireMaxPacketSize];
uint8_t sw_rxbuf[SingleWireMaxPacketSize];

//キー状態
uint8_t keyStateFlags[NumKeySlotBytes] = { 0 };
uint8_t nextKeyStateFlags[NumKeySlotBytes] = { 0 };

bool isSideBrainModeEnabled = false;

uint8_t local_layerIndex = 0;
uint8_t local_hidReport[8] = { 0 };

//---------------------------------------------

void emitHidKeyStateReport(uint8_t *pReportBytes8) {
  bool done = usbioCore_hidKeyboard_writeReport(pReportBytes8);
  if (!done) {
    //todo: 送信できない場合のために、usbioCore内でホストから次のデータ要求があった場合に再送信する実装を行う
    printf("[warn] failed to write keyboard report\n");
  }
}

void debugDumpReport(uint8_t *report) {
  generalUtils_debugShowBytes(report, 8);
}

void processKeyboardCoreLogicOutput() {
  uint8_t layerIndex = keyboardCoreLogic_getCurrentLayerIndex();
  uint8_t *hidReport = keyboardCoreLogic_getOutputHidReportBytes();
  if (layerIndex != local_layerIndex) {
    configuratorServant_emitRelatimeLayerEvent(layerIndex);
    local_layerIndex = layerIndex;
  }
  if (!generalUtils_compareBytes(hidReport, local_hidReport, 8)) {
    debugDumpReport(hidReport);
    if (EmitHidKeys) {
      emitHidKeyStateReport(hidReport);
    }
    generalUtils_copyBytes(local_hidReport, hidReport, 8);
  }
}

//---------------------------------------------

//キーが押された/離されたときに呼ばれるハンドラ, 両手用
void onPhysicalKeyStateChanged(uint8_t keySlotIndex, bool isDown) {
  if (keySlotIndex >= NumKeySlots) {
    return;
  }
  int8_t keyIndex = pgm_read_byte(keySlotIndexToKeyIndexMap + keySlotIndex);
  if (!(0 <= keyIndex && keyIndex < KeyIndexRange)) {
    return;
  }
  if (isDown) {
    printf("keydown %d\n", keyIndex);
    pressedKeyCount++;
  } else {
    printf("keyup %d\n", keyIndex);
    pressedKeyCount--;
  }

  if (!isSideBrainModeEnabled) {
    keyboardCoreLogic_issuePhysicalKeyStateChanged(keyIndex, isDown);
    processKeyboardCoreLogicOutput();
  }
  configuratorServant_emitRealtimeKeyEvent(keyIndex, isDown);
}

//---------------------------------------------

void configuratorServantStateHandler(uint8_t state) {
  if (state == ConfiguratorServantState_KeyMemoryUpdationStarted) {
    configurationMemoryReader_stop();
  }
  if (state == ConfiguratorServentState_KeyMemoryUpdationDone) {
    configurationMemoryReader_initialize();
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

void pullAltSideKeyStates() {
  sw_txbuf[0] = 0x40;
  singlewire_sendFrame(sw_txbuf, 1);
  uint8_t sz = singlewire_receiveFrame(sw_rxbuf, SingleWireMaxPacketSize);
  if (sz > 0) {
    uint8_t cmd = sw_rxbuf[0];
    if (cmd == 0x41 && sz == 1 + NumKeySlotBytesHalf) {
      uint8_t *payloadBytes = sw_rxbuf + 1;
      //子-->親, キー状態応答パケット受信, 子のキー状態を受け取り保持
      generalUtils_copyBitFlagsBuf(nextKeyStateFlags, NumKeySlotsHalf, payloadBytes, 0, NumKeySlotsHalf);
      // toggleLED0();
      // generalUtils_debugShowBytes(sw_rxbuf, sz);
    }
  }
}

void processKeyStatesUpdate() {
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

void runAsMaster() {
  keyMatrixScanner_initialize(
      NumRows, NumColumns, rowPins, columnPins, nextKeyStateFlags);

  singlewire_initialize();

  configurationMemoryReader_initialize();
  configuratorServant_initialize(
      KeyIndexRange,
      configuratorServantStateHandler);

  uint16_t cnt = 0;
  while (1) {
    cnt++;
    if (cnt % 6 == 0) {
      keyMatrixScanner_update();
      processKeyStatesUpdate();
      outputLED1(pressedKeyCount > 0);
    }
    if (cnt % 6 == 3) {
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
void sendKeyStateResponsePacketToMaster() {
  sw_txbuf[0] = 0x41;
  generalUtils_copyBytes(sw_txbuf + 1, nextKeyStateFlags, NumKeySlotBytesHalf);
  singlewire_sendFrame(sw_txbuf, 1 + NumKeySlotBytesHalf);
}

void onRecevierInterruption() {
  uint8_t sz = singlewire_receiveFrame(sw_rxbuf, SingleWireMaxPacketSize);
  if (sz > 0) {
    uint8_t cmd = sw_rxbuf[0];
    if (cmd == 0x40 && sz == 1) {
      //親-->子, キー状態要求パケット受信, キー状態応答パケットを返す
      sendKeyStateResponsePacketToMaster();
      // toggleLED0();
    }
  }
}

bool checkIfSomeKeyPressed() {
  for (uint8_t i = 0; i < NumKeySlotBytesHalf; i++) {
    if (nextKeyStateFlags[i] > 0) {
      return true;
    }
  }
  return false;
}

void runAsSlave() {

  keyMatrixScanner_initialize(
      NumRows, NumColumns, rowPins, columnPins, nextKeyStateFlags);

  singlewire_initialize();
  singlewire_setupInterruptedReceiver(onRecevierInterruption);

  uint16_t cnt = 0;
  while (1) {
    cnt++;
    if (cnt % 6 == 0) {
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

bool checkIsMaster() {
  uint16_t cnt = 0;
  while (cnt < 500) {
    if (usbioCore_isConnectedToHost()) {
      return true;
    }
    _delay_ms(1);
    cnt++;
  }
  return false;
}

void keyboardEntry() {
  initDebugUART(38400);
  printf("start1\n");
  initBoardIo();
  usbioCore_initialize();
  sei();
  bool isMaster = checkIsMaster();
  printf("isMaster:%d\n", isMaster);
  if (isMaster) {
    runAsMaster();
  } else {
    runAsSlave();
  }
}

int main() {
  USBCON = 0;
  keyboardEntry();
  return 0;
}
