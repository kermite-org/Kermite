#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/wrapper/generalKeyboard.h"

static const uint8_t directWiredKeyInputPins[1] = { P_B5 };

int main() {
  boardIo_setupLeds_proMicroAvr();
  debugUart_initialize(38400);
  keyScanner_directWired_initialize(1, directWiredKeyInputPins, 0);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
  generalKeyboard_start();
  return 0;
}
