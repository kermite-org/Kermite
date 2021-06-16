#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/wrapper/splitKeyboard.h"

#define NumColumns 4
#define NumRows 3

static const uint8_t columnPins[NumColumns] = { GP2, GP3, GP4, GP5 };
static const uint8_t rowPins[NumRows] = { GP7, GP8, GP9 };

static void setupBoard(int8_t side) {
  uint8_t scanOffset = side == 0 ? 0 : 12;
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins, scanOffset);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
}

int main() {
  boardIo_setupLeds_rpiPico();
  debugUart_initialize(115200);
  splitKeyboard_setBoardConfigCallback(setupBoard);
  splitKeyboard_start();
  return 0;
}
