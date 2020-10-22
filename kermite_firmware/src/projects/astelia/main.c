#include "ConfigStorageValidator.h"
#include "KeyMatrixScanner2.h"
#include "bit_operations.h"
#include "configuratorServant.h"
#include "debugUart.h"
#include "keyboardCoreLogic2.h"
#include "pio.h"
#include "usbioCore.h"
#include "utils.h"
#include <avr/interrupt.h>
#include <avr/io.h>
#include <avr/pgmspace.h>
#include <stdio.h>
#include <util/delay.h>

//---------------------------------------------
//board io

#define pin_LED0 P_D5
#define pin_LED1 P_B0

static void initBoardIo() {
  pio_setOutput(pin_LED0);
  pio_setOutput(pin_LED1);
}

static void outputLED0(bool val) {
  pio_output(pin_LED0, !val);
}

#if 0
static void toggleLED0() {
  pio_toggleOutput(pin_LED0);
}
#endif

static void outputLED1(bool val) {
  pio_output(pin_LED1, val);
}

//---------------------------------------------
//definitions

#define NumRows 8
#define NumColumns 6

static const uint8_t rowPins[NumRows] = { P_D7, P_E6, P_B4, P_B5, P_B1, P_B3, P_B2, P_B6 };

#define REVISION 4
#if REVISION == 3
static const uint8_t columnPins[NumColumns] = { P_C6, P_D4, P_F4, P_F5, P_F6, P_F7 };
#elif REVISION >= 4
static const uint8_t columnPins[NumColumns] = { P_C6, P_D4, P_F7, P_F6, P_F5, P_F4 };
#endif

//キー状態ビットフラグのバイト配列の要素数
#define NumKeySlotBytes 6 //Ceil(NumRows * NumColumns / 8);

//キー数
#define NumKeySlots 48
#define NumPhysicalKeys 48

static bool EmitHidKeys = true;
//static bool EmitHidKeys = false;

static bool isSideBrainModeEnabled = false;

//---------------------------------------------
//variables

static uint8_t pressedKeyCount = 0;

//キー状態
static uint8_t keyStateFlags[NumKeySlotBytes] = { 0 };
static uint8_t nextKeyStateFlags[NumKeySlotBytes] = { 0 };

uint16_t local_layerFlags = 0;
uint8_t local_hidReport[8] = { 0 };

//---------------------------------------------

static void emitHidKeyStateReport(uint8_t *pReportBytes8) {
  bool done = usbioCore_hidKeyboard_writeReport(pReportBytes8);
  if (!done) {
    //todo: 送信できない場合のために、usbioCore内でホストから次のデータ要求があった場合に再送信する実装を行う
    printf("[warn] failed to write keyboard report\n");
  }
}

static void debugDumpReport(uint8_t *report) {
  utils_debugShowBytes(report, 8);
}

static void processKeyboardCoreLogicOutput() {
  uint16_t layerFlags = keyboardCoreLogic_getLayerActiveFlags();
  uint8_t *hidReport = keyboardCoreLogic_getOutputHidReportBytes();
  if (layerFlags != local_layerFlags) {
    configuratorServant_emitRelatimeLayerEvent(layerFlags);
    local_layerFlags = layerFlags;
  }
  if (!utils_compareBytes(hidReport, local_hidReport, 8)) {
    debugDumpReport(hidReport);
    if (EmitHidKeys) {
      emitHidKeyStateReport(hidReport);
    }
    utils_copyBytes(local_hidReport, hidReport, 8);
  }
}

//---------------------------------------------

#if REVISION == 4
// clang-format off
static const int8_t keySlotIndexToKeyIndexMap[NumKeySlots] PROGMEM = {
  //right
  24, 25, 26, 27, 28, 29,
  30, 31, 32, 33, 34, 35,
  36, 37, 38, 39, 40, 41,
  42, 43, 44, 45, 46, 47,
  //left
   0,  1,  2,  3,  4,  5, 
   6,  7,  8,  9, 10, 11, 
  12, 13, 14, 15, 16, 17, 
  18, 19, 20, 21, 22, 23,
};
// clang-format on
#else
// clang-format off
static const int8_t keySlotIndexToKeyIndexMap[NumKeySlots] PROGMEM = {
  //left
   0,  1,  2,  3,  4,  5, 
   6,  7,  8,  9, 10, 11, 
  12, 13, 14, 15, 16, 17, 
  18, 19, 20, 21, 22, 23,
  //right
  24, 25, 26, 27, 28, 29,
  30, 31, 32, 33, 34, 35,
  36, 37, 38, 39, 40, 41,
  42, 43, 44, 45, 46, 47,
};
// clang-format on

#endif

//キーが押された/離されたときに呼ばれるハンドラ, 両手用
void onPhysicalKeyStateChanged(uint8_t keySlotIndex, bool isDown) {
  if (keySlotIndex >= NumKeySlots) {
    return;
  }
  int8_t keyIndex = pgm_read_byte(keySlotIndexToKeyIndexMap + keySlotIndex);
  if (!(0 <= keyIndex && keyIndex < NumPhysicalKeys)) {
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
  }
  configuratorServant_emitRealtimeKeyEvent(keyIndex, isDown);
}

//---------------------------------------------

static void resetKeyboardCoreLogic() {
  bool configMemoryValid = configStorageValidator_checkDataHeader();
  if (configMemoryValid) {
    keyboardCoreLogic_initialize();
  } else {
    keyboardCoreLogic_halt();
  }
}

void configuratorServantStateHandler(uint8_t state) {
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

void processKeyStatesUpdate() {
  for (uint8_t i = 0; i < NumKeySlotBytes; i++) {
    uint8_t byte0 = keyStateFlags[i];
    uint8_t byte1 = nextKeyStateFlags[i];
    for (uint8_t j = 0; j < 8; j++) {
      uint8_t keySlotIndex = i * 8 + j;
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
  resetKeyboardCoreLogic();
  configuratorServant_initialize(
      NumPhysicalKeys,
      configuratorServantStateHandler);
  keyboardCoreLogic_initialize();

  uint16_t cnt = 0;
  sei();
  while (1) {
    cnt++;
    if (cnt % 10 == 0) {
      keyMatrixScanner_update();
      processKeyStatesUpdate();
      keyboardCoreLogic_processTicker(10);
      processKeyboardCoreLogicOutput();
      outputLED1(!(pressedKeyCount > 0));
    }
    if (cnt % 1000 == 0) {
      outputLED0(true);
    }
    if (cnt % 1000 == 1) {
      outputLED0(false);
    }
    _delay_ms(1);
    configuratorServant_processUpdate();
  }
}

//---------------------------------------------

void keyboardEntry() {
  debugUart_setup(38400);
  printf("start1\n");
  initBoardIo();
  usbioCore_initialize();
  runAsMaster();
}

int main() {
  USBCON = 0;
  keyboardEntry();
  return 0;
}
