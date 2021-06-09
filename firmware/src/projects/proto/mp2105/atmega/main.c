#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/serialLed.h"
#include "km0/device/system.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/scanner/keyScanner_encoderBasic.h"
#include "km0/visualizer/oledDisplay.h"
#include "km0/visualizer/rgbLighting.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumColumns 4
#define NumRows 3
#define NumKeys (NumColumns * NumRows)
#define NumEncoders 1

#define NumScanSlots (NumKeys + NumEncoders * 2)

static const uint8_t columnPins[NumColumns] = { P_D7, P_E6, P_B4, P_B5 };
static const uint8_t rowPins[NumRows] = { P_B3, P_B2, P_B6 };

// clang-format off
static const int8_t keyIndexTable[NumScanSlots] = {
   0,  1,  2,  3, 
   4,  5,  6,  7,
   8,  9, 10, 11,
   12, 13
};
// clang-format on

static EncoderConfig encoderConfigs[NumEncoders] = {
  { .pinA = P_B1, .pinB = P_F7, .scanIndexBase = 12 },
};

int main() {
  boardIo_setupLeds_proMicroAvr();
  debugUart_initialize(38400);
  oledDisplay_initialize();
  rgbLighting_initialize();
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  keyScanner_encoderBasic_initialize(NumEncoders, encoderConfigs);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  keyboardMain_useKeyScanner(keyScanner_encoderBasic_update);
  keyboardMain_useVisualModule(oledDisplay_update);
  keyboardMain_useVisualModule(rgbLighting_update);
  generalKeyboard_start();
  return 0;
}
