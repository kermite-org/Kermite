#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumColumns 3
#define NumRows 5
#define NumScanSlots (NumColumns * NumRows)

static const uint8_t columnPins[NumColumns] = { F4, F5, F6 };
static const uint8_t rowPins[NumRows] = { D4, C6, D7, E6, B4 };

// clang-format off
static const int8_t keyIndexTable[NumScanSlots] = {
  0, 1, 2,  
  3, 4, 5,
  6, 7, 8,
  9, 10, 11,
  12, 13, 14
};
// clang-format on

int main() {
  boardIo_setupLeds_proMicroAvr();
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  generalKeyboard_start();
  return 0;
}
