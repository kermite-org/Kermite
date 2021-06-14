#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/wrapper/splitKeyboard.h"

#define NumKeysL 2
#define NumKeysR 4
static const uint8_t keyInputPinsL[NumKeysL] = { B5, B6 };
static const uint8_t keyInputPinsR[NumKeysR] = { E6, B4, B5, B6 };

static void setupBoard(uint8_t side) {
  if (side == 0) {
    keyScanner_directWired_initialize(NumKeysL, keyInputPinsL);
    keyboardMain_useKeyScanner(keyScanner_directWired_update);
  } else {
    keyScanner_directWired_initialize(NumKeysR, keyInputPinsR);
    keyboardMain_useKeyScanner(keyScanner_directWired_update);
  }
}

int main() {
  debugUart_initialize(38400);
  boardIo_setupLeds_proMicroAvr();
  splitKeyboard_setBoardConfigCallback(setupBoard);
  splitKeyboard_start();
  return 0;
}
