#include "config.h"
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/digitalIo.h"
#include "km0/deviceIo/serialLed.h"
#include "km0/deviceIo/system.h"
#include "km0/keyboard/generalKeyboard.h"
#include "km0/keyboard/keyScanner_basicMatrix.h"
#include "km0/keyboard/keyScanner_encoderBasic.h"
#include "km0/keyboard/keyboardMain.h"
#include "km0/visualizer/oledDisplay.h"
#include "km0/visualizer/rgbLighting.h"

#define NumColumns 4
#define NumRows 3
#define NumKeys (NumColumns * NumRows)
#define NumEncoderScanSlots 2
#define NumScanSlots (NumKeys + NumEncoderScanSlots)

static const uint8_t columnPins[NumColumns] = { GP6, GP7, GP8, GP9 };
static const uint8_t rowPins[NumRows] = { GP20, GP23, GP21 };

// clang-format off
static const int8_t keyIndexTable[NumScanSlots] = {
   0,  1,  2,  3, 
   4,  5,  6,  7,
   8,  9, 10, 11,
   12, 13
};
// clang-format on

static EncoderConfig encoderConfigs[] = {
  { .pin1 = GP22, .pin2 = GP26, .scanIndexBase = 12 },
};

int main() {
  boardIo_setupLeds_proMicroRp();
  keyboardMain_useDebugUart(115200);
  keyboardMain_setKeyIndexTable(keyIndexTable);

  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);

  keyScanner_encoderBasic_initialize(1, encoderConfigs);
  keyboardMain_useKeyScannerExtra(keyScanner_encoderBasic_update);

  oledDisplay_initialize();
  keyboardMain_useDisplayModule(oledDisplay_update);

  rgbLighting_initialize(GP29, NumKeys);
  keyboardMain_useDisplayModule(rgbLighting_update);

  generalKeyboard_start();
  return 0;
}