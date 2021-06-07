#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumColumns 3
#define NumRows 5
#define NumScanSlots (NumColumns * NumRows)

static const uint8_t columnPins[NumColumns] = { P_F4, P_F5, P_F6 };
static const uint8_t rowPins[NumRows] = { P_D4, P_C6, P_D7, P_E6, P_B4 };

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
  keyboardMain_setKeyIndexTable(keyIndexTable);
  generalKeyboard_start();
  return 0;
}
