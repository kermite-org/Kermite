#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumColumns 4
#define NumRows 3

static const uint8_t columnPins[NumColumns] = { P_D7, P_E6, P_B4, P_B5 };
static const uint8_t rowPins[NumRows] = { P_B3, P_B2, P_B6 };

int main() {
  boardIo_setupLeds_proMicroAvr();
  debugUart_initialize(38400);
  keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins, 0);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  generalKeyboard_start();
  return 0;
}
