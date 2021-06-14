#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumColumns 3
#define NumRows 5

static const uint8_t columnPins[NumColumns] = { F4, F5, F6 };
static const uint8_t rowPins[NumRows] = { D4, C6, D7, E6, B4 };

int main() {
  boardIo_setupLeds_proMicroAvr();
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  generalKeyboard_start();
  return 0;
}
