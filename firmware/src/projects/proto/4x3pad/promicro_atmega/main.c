#include "config.h"
#include "dio.h"
#include "generalKeyboard.h"
#include <avr/pgmspace.h>

#define NumColumns 4
#define NumRows 3
#define NumKeySlots (NumColumns * NumRows)

static const uint8_t columnPins[NumColumns] PROGMEM = { P_D7, P_E6, P_B4, P_B5 };
static const uint8_t rowPins[NumRows] PROGMEM = { P_B3, P_B2, P_B6 };

// clang-format off
static const int8_t keyIndexTable[NumKeySlots] PROGMEM = {
   0,  1,  2,  3, 
   4,  5,  6,  7,
   8,  9, 10, 11
};
// clang-format on

int main() {
  generalKeyboard_useIndicatorLEDs(P_B0, P_D5, true);
  generalKeyboard_useDebugUART(38400);
  generalKeyboard_setup(NumRows, NumColumns, rowPins, columnPins, keyIndexTable);
  generalKeyboard_start();
  return 0;
}
