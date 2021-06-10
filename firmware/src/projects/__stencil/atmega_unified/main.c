#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/wrapper/generalKeyboard.h"

static const uint8_t columnPins[KS_NUM_COLUMNS] = KS_COLUMN_PINS;
static const uint8_t rowPins[KS_NUM_ROWS] = KS_ROW_PINS;

int main() {
#ifdef KS_USE_PROMICRO_BOARD_LEDS
  boardIo_setupLeds_proMicroAvr();
#endif
  keyScanner_basicMatrix_initialize(KS_NUM_ROWS, KS_NUM_COLUMNS, rowPins, columnPins);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  generalKeyboard_start();
  return 0;
}
