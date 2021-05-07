#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/dio.h"
#include "km0/keyboard/keyScanner_basicMatrix.h"
#include "km0/keyboard/keyboardMain.h"
#include "km0/keyboard/splitKeyboard.h"

//---------------------------------------------

#define NumColumns 7
#define NumRows 4
#define NumScanSlots 56

static const uint8_t columnPins[NumColumns] = { GP28, GP27, GP26, GP22, GP20, GP23, GP21 };
static const uint8_t rowPins[NumRows] = { GP6, GP7, GP8, GP9 };

// clang-format off
static const int8_t keyIndexTable[NumScanSlots]  = {
  //left
    0,  1,  2,  3,  4,  5,  6,
    7,  8,  9, 10, 11, 12, 13, 
   14, 15, 16, 17, 18, 19, 20, 
   21, 22, 23, 24, 25, 26, 27,
  //right
   28, 29, 30, 31, 32, 33, 34,
   35, 36, 37, 38, 39, 40, 41, 
   42, 43, 44, 45, 46, 47, 48, 
   49, 50, 51, 52, 53, 54, 55,  
};
// clang-format on

int main() {
  boardIo_setupLeds_proMicroRp();
  keyboardMain_useDebugUart(115200);
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  splitKeyboard_start();
  return 0;
}
