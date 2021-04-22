#include "dio.h"
#include "splitKeyboard.h"
//---------------------------------------------

#define NumColumns 8
#define NumRows 5
#define NumKeySlots 80

static const uint8_t columnPins[NumColumns] = { GP29, GP28, GP27, GP26, GP22, GP20, GP23, GP21 };
static const uint8_t rowPins[NumRows] = { GP5, GP6, GP7, GP8, GP9 };

// clang-format off
static const int8_t keyIndexTable[NumKeySlots]  = {
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
  splitKeyboard_useIndicatorRgbLed(GP25);
  splitKeyboard_useDebugUart(115200);
  splitKeyboard_setup(NumRows, NumColumns, rowPins, columnPins, keyIndexTable);
  splitKeyboard_start();
  return 0;
}
