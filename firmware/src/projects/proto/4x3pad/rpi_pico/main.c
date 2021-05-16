#include "config.h"
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/dio.h"
#include "km0/keyboard/generalKeyboard.h"
#include "km0/keyboard/keyScanner_basicMatrix.h"
#include "km0/keyboard/keyboardMain.h"

#define NumColumns 4
#define NumRows 3
#define NumScanSlots (NumColumns * NumRows)

static const uint8_t columnPins[NumColumns] = { GP2, GP3, GP4, GP5 };
static const uint8_t rowPins[NumRows] = { GP7, GP8, GP9 };

// clang-format off
static const int8_t keyIndexTable[NumScanSlots] = {
   0,  1,  2,  3, 
   4,  5,  6,  7,
   8,  9, 10, 11
};
// clang-format on

int main() {
  boardIo_setupLeds_rpiPico(); //RPi pico
  // boardIo_setupLeds_proMicroRp(); //promicro rp2040
  keyboardMain_useDebugUart(115200);
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  generalKeyboard_start();
  return 0;
}