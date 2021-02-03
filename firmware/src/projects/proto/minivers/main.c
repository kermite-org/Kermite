#include "config.h"
#include "pio.h"
#include "splitKeyboard.h"
#include <avr/pgmspace.h>

//---------------------------------------------

#define NumRows SK_NUM_ROWS
#define NumColumns SK_NUM_COLUMNS
#define NumKeySlots (NumRows * NumColumns * 2)

static const uint8_t rowPins[NumRows] = { P_C6, P_D7, P_E6, P_B4, P_B5 };
static const uint8_t columnPins[NumColumns] = { P_F4, P_F5, P_F6, P_F7, P_B1, P_B3, P_B2, P_B6 };

// clang-format off
static const int8_t keyIndexTable[NumKeySlots] PROGMEM = {
  //left
   0,  1,  2,  3,  4,  5,  6,  7,
   8,  9, 10, 11, 12, 13, 14, 15,
  16, 17, 18, 19, 20, 21, 22, 23,
  24, 25, 26, 27, 28, 29, 30, 31,
  32, 33, 34, 35, -1, 36, 37, 38,
  //right
  40, 41, 42, 43, 44, 45, 46, 47, 
  48, 49, 50, 51, 52, 53, 54, 55, 
  56, 57, 58, 59, 60, 61, 62, 63, 
  64, 65, 66, 67, 68, 69, 70, 71, 
  72, 73, 74, 75, -1, 76, 77, 78
};
// clang-format on

int main() {
  splitKeyboard_useOnboardLeds();
  splitKeyboard_useDebugUART(38400);
  printf("test0203\n");
  splitKeyboard_setup(rowPins, columnPins, keyIndexTable);
  splitKeyboard_start();
  return 0;
}
