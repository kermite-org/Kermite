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
#define NumScanSlots 42

static const uint8_t columnPins[NumColumns] = { P_D4, P_C6, P_D7 };
static const uint8_t rowPins[NumRows] = { P_E6, P_B4 };

static const uint8_t extraPins[NumExtraKeys] = { P_B6 };

// clang-format off
static const int8_t keyIndexTable[NumScanSlots] = {
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  2,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  3,
};
// clang-format on

static void setupBoard(int8_t side) {
  if (side == 0) {
    keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins, 0);
    keyScanner_directWired_initialize(NumExtraKeys, extraPins, 20);
  } else {
    keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins, 21);
    keyScanner_directWired_initialize(NumExtraKeys, extraPins, 41);
  }
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
}

int main() {
  debugUart_initialize(38400);
  boardIo_setupLeds_proMicroAvr();
  oledDisplay_initialize();
  rgbLighting_preConfigure();
  rgbLighting_initialize();
  keyboardMain_useOledDisplayModule(oledDisplay_update);
  keyboardMain_useRgbLightingModule(rgbLighting_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  splitKeyboard_setBoardConfigCallback(setupBoard);
  splitKeyboard_start();
  return 0;
}
