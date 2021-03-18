#include "config.h"
#include "dio.h"
#include "generalKeyboard.h"

#define NumRows GK_NUM_ROWS
#define NumColumns GK_NUM_COLUMNS
#define NumKeySlots (NumRows * NumColumns)

static const uint8_t rowPins[NumRows] = { GP2, GP3, GP4 };
static const uint8_t columnPins[NumColumns] = { GP12, GP13, GP14, GP15 };

// clang-format off
static const int8_t keyIndexTable[NumKeySlots] = {
   0,  1,  2,  3, 
   4,  5,  6,  7,
   8,  9, 10, 11
};
// clang-format on

int main() {
  generalKeyboard_useOnboardLeds(GP25, GP25);
  generalKeyboard_useDebugUART(38400);
  generalKeyboard_setup(rowPins, columnPins, keyIndexTable);
  generalKeyboard_start();
  return 0;
}
