#include "km0/device/boardIo.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/visualizer/oledDisplay.h"
#include "km0/visualizer/rgbLighting.h"
#include "km0/wrapper/splitKeyboard.h"

//---------------------------------------------

#define NumColumns 6
#define NumRows 4
#define NumScanSlots (NumColumns * NumRows * 2)

static const uint8_t columnPins[NumColumns] = { P_F4, P_F5, P_F6, P_F7, P_B1, P_B3 };
static const uint8_t rowPins[NumRows] = { P_D4, P_C6, P_D7, P_E6 };

// clang-format off
static const int8_t keyIndexTable[NumScanSlots] = {
  //left
   5,  4,  3,  2,  1,  0,
  11, 10,  9,  8,  7,  6,
  17, 16, 15, 14, 13, 12,
  -1, -1, -1, 20, 19, 18,
  //right
  26, 25, 24, 23, 22, 21,
  32, 31, 30, 29, 28, 27,
  38, 37, 36, 35, 34, 33,
  -1, -1, -1, 41, 40, 39,
};
// clang-format on

int main() {
  boardIo_setupLeds_proMicroAvr();
  oledDisplay_initialize();
  rgbLighting_initialize();
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  keyboardMain_useVisualModule(oledDisplay_update);
  keyboardMain_useVisualModule(rgbLighting_update);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  splitKeyboard_start();
  return 0;
}
