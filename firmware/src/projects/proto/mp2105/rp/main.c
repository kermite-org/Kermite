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

// clang-format off
uint32_t colors[] = { 
  0xFF0000, 0x00FF00, 0x0000FF, 0x333333,
  0x00FFFF, 0xFF00FF, 0xFFFF00, 0x888888,
  0xFF8800, 0x00FF88, 0x8800FF, 0xFFFFFF,
 };
// clang-format on

void processLighting() {
  static int cnt = 0;
  uint termMs = 2000;
  float p = (cnt % termMs) / (float)termMs;
  float q = p < 0.5 ? 2 * p : (2 - 2 * p);
  uint32_t alpha = q * 20;
  for (int i = 0; i < 12; i++) {
    uint32_t col = (alpha << 24) | colors[i];
    serialLed_putPixel(col);
  }
  cnt++;
}

#define NumColumns 4
#define NumRows 3
#define NumEncoderScanSlots 2
#define NumKeyScanSlots (NumColumns * NumRows)
#define NumScanSlots (NumKeyScanSlots + NumEncoderScanSlots)

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
  serialLed_initialize(GP29);
  boardIo_setupLeds_proMicroRp();
  oledDisplay_initialize();
  keyboardMain_useDebugUart(115200);
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  keyScanner_encoderBasic_initialize(1, encoderConfigs);
  keyboardMain_useKeyScannerExtra(keyScanner_encoderBasic_update);
  keyboardMain_useDisplayModule(oledDisplay_update);
  keyboardMain_useDisplayModule(processLighting);
  generalKeyboard_start();
  return 0;
}