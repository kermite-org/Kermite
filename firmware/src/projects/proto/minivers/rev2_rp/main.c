#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/wrapper/splitKeyboard.h"
#include <stdio.h>

//---------------------------------------------

#define NumColumns 7
#define NumRows 4

static const uint8_t columnPins[NumColumns] = { GP28, GP27, GP26, GP22, GP20, GP23, GP21 };
static const uint8_t rowPins[NumRows] = { GP6, GP7, GP8, GP9 };

int main() {
  debugUart_initialize(115200);
  boardIo_setupLeds_proMicroRp();
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  splitKeyboard_start();
  return 0;
}
