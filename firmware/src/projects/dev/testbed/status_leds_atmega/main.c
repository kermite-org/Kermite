#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/visualizer/keyboardStatusLeds.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumScanSlots 4

static const uint8_t keyInputPins[NumScanSlots] = { P_D7, P_E6, P_B4, P_B5 };

int main() {
  debugUart_initialize(38400);
  boardIo_setupLeds_proMicroAvr();
  keyScanner_directWired_initialize(NumScanSlots, keyInputPins, 0);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
  keyboardStatusLeds_initialize();
  keyboardMain_useHostKeyboardStatusOutputModule(keyboardStatusLeds_update);
  generalKeyboard_start();
  return 0;
}
