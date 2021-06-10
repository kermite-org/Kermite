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

static const uint8_t columnPins[NumColumns] = { B3, B1, F7, F6, F5, F4 };
static const uint8_t rowPins[NumRows] = { D4, C6, D7, E6 };

int main() {
  boardIo_setupLeds_proMicroAvr();
  oledDisplay_initialize();
  rgbLighting_initialize();
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  keyboardMain_useVisualModule(oledDisplay_update);
  keyboardMain_useVisualModule(rgbLighting_update);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  splitKeyboard_start();
  return 0;
}
