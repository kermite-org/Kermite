#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"
#include "km0/wrapper/splitKeyboard.h"

//---------------------------------------------

//左右非対称のキーマトリクスを実験

#define NumColumns 8
#define NumRows 5
static const uint8_t columnPins[NumColumns] = { P_F4, P_F5, P_F6, P_F7, P_B1, P_B3, P_B2, P_B6 };
static const uint8_t rowPins[NumRows] = { P_C6, P_D7, P_E6, P_B4, P_B5 };

#define NumColumnsR 4
#define NumRowsR 5
static const uint8_t columnPinsR[NumColumnsR] = { P_F6, P_F7, P_B1, P_B3 };
static const uint8_t rowPinsR[NumRowsR] = { P_C6, P_D7, P_E6, P_B4, P_B5 };

static void setupBoard(int8_t side) {
  if (side == 0) {
    keyScanner_basicMatrix_initialize(NumRows, NumColumns, rowPins, columnPins, 0);
    keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  } else {
    keyScanner_basicMatrix_initialize(NumRowsR, NumColumnsR, rowPinsR, columnPinsR, 40);
    keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
  }
}

int main() {
  debugUart_initialize(38400);
  boardIo_setupLeds_proMicroAvr();
  splitKeyboard_setBoardConfigCallback(setupBoard);
  splitKeyboard_start();
  return 0;
}
