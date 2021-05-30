#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/visualizer/oledDisplay.h"
#include "km0/visualizer/rgbLighting.h"
#include "km0/wrapper/splitKeyboard.h"

//---------------------------------------------

#define NumColumns 3
#define NumRows 2
#define NumExtraKeys 1
// #define NumScanSlots ((NumColumns * NumRows + NumExtraKeys) * 2)
#define NumScanSlots 42
// #define NumScanSlots 82

static const uint8_t columnPins[NumColumns] = { P_D4, P_C6, P_D7 };
static const uint8_t rowPins[NumRows] = { P_E6, P_B4 };

static const uint8_t extraPins[NumExtraKeys] = { P_B6 };

#if 0
// clang-format off
static const int8_t keyIndexTable[NumScanSlots] = {
  //left
  0,  1,  2,  3,  4,
  5,  6,  7,  8,  9,
  10, 11, 12, 13, 14,
  15, 16, 17, 18, 19,
  20,
  //right
  21, 22, 23, 24, 25,
  26, 27, 28, 29, 30,
  31, 32, 33, 34, 35,
  36, 37, 38, 39, 40,
  41,
};
// clang-format on

// clang-format off
static const int8_t keyIndexTable[NumScanSlots] = {
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1,
};
// clang-format on

#endif

// clang-format off
static const int8_t keyIndexTable[NumScanSlots] = {
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  1,
};
// clang-format on

int main() {
  debugUart_initialize(38400);
  boardIo_setupLeds_proMicroAvr();
  oledDisplay_initialize();
  rgbLighting_initialize();
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  keyScanner_directWired_initialize(NumExtraKeys, extraPins);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
  keyboardMain_useDisplayModule(oledDisplay_update);
  keyboardMain_useDisplayModule(rgbLighting_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  splitKeyboard_start();
  return 0;
}
