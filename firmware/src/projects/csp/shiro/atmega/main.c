#include "config.h"
#include "km0/deviceIo/dio.h"
#include "km0/keyboard/generalKeyboard.h"
#include "km0/keyboard/keyScanner_basicMatrix.h"

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
  generalKeyboard_useIndicatorLeds(P_B0, P_D5, true);
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  generalKeyboard_useKeyCanner(keyScanner_basicMatrix_update);
  generalKeyboard_setKeyIndexTable(keyIndexTable);
  generalKeyboard_start();
  return 0;
}
