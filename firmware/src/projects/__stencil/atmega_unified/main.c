#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumColumns KS_NUM_COLUMNS
#define NumRows KS_NUM_ROWS

static const uint8_t columnPins[NumColumns] = KS_COLUMN_PINS;
static const uint8_t rowPins[NumRows] = KS_ROW_PINS;

int main() {
  boardIo_setupLeds_proMicroAvr();
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  generalKeyboard_start();
  return 0;
}
