#include "config.h"
#include "km0/device/boardIoImpl.h"
#include "km0/device/boardLink.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/wrapper/splitKeyboard.h"
#define NumKeys 4

static const uint8_t dwPins[NumKeys] = { E6, B4, B5, B6 };

static void setupBoard(int8_t side) {
  uint8_t scanIndexBase = side == 0 ? 0 : NumKeys;
  keyScanner_directWired_initialize(NumKeys, dwPins, scanIndexBase);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
}

int main() {
  boardIoImpl_setupLeds_proMicroAvr();
  debugUart_initialize(38400);
  // boardLink_singleWire_setSignalPin(D2);
  splitKeyboard_setBoardConfigCallback(setupBoard);
  splitKeyboard_start();
  return 0;
}
