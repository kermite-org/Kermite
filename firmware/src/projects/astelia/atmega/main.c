#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumColumns 6
#define NumRows 8
#define NumScanSlots (NumColumns * NumRows)

static const uint8_t columnPins[NumColumns] = { C6, D4, F7, F6, F5, F4 };
static const uint8_t rowPins[NumRows] = { B1, B3, B2, B6, D7, E6, B4, B5 };

int main() {
  boardIo_setupLeds_proMicroAvr();
  debugUart_initialize(38400);
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  generalKeyboard_start();
  return 0;
}
