#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/wrapper/splitKeyboard.h"

#define NumColumns 4
#define NumRows 3
#define NumScanSlots 24

static const uint8_t columnPins[NumColumns] = { GP2, GP3, GP4, GP5 };
static const uint8_t rowPins[NumRows] = { GP7, GP8, GP9 };

// clang-format off
static const int8_t keyIndexTable[NumScanSlots] = {
  //left
  0,  1,  2,  3,
  4,  5,  6,  7,
  8,  9, 10, 11,
  //right
  12, 13, 14, 15,
  16, 17, 18, 19,
  20, 21, 22, 23
};
// clang-format on

int main() {
  boardIo_setupLeds_rpiPico(); //RPi pico
  // boardIo_setupLeds_proMicroRp(); //promicro rp2040
  keyboardMain_useDebugUart(115200);
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  splitKeyboard_start();
  return 0;
}
