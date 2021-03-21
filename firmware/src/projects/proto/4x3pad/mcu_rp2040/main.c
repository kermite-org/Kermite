#include "config.h"
#include "dio.h"
#include "generalKeyboard.h"

#define NumColumns 4
#define NumRows 3
#define NumKeySlots (NumColumns * NumRows)

static const uint8_t columnPins[NumColumns] = { GP12, GP13, GP14, GP15 };
static const uint8_t rowPins[NumRows] = { GP2, GP3, GP4 };

// static const uint8_t columnPins[NumColumns] = { GP2, GP3, GP4, GP5 };
// static const uint8_t rowPins[NumRows] = { GP7, GP8, GP9 };

// clang-format off
static const int8_t keyIndexTable[NumKeySlots] = {
   0,  1,  2,  3, 
   4,  5,  6,  7,
   8,  9, 10, 11
};
// clang-format on

int main() {
  generalKeyboard_useIndicatorLEDs(GP25, GP25, false); //RPi pico
  // generalKeyboard_useIndicatorRgbLED(GP25); //promicro rp2040
  generalKeyboard_useDebugUART(38400);
  generalKeyboard_setup(NumRows, NumColumns, rowPins, columnPins, keyIndexTable);
  generalKeyboard_start();
  return 0;
}
