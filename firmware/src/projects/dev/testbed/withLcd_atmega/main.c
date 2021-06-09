#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/visualizer/oledDisplay.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumScanSlots 4

static const uint8_t keyInputPins[NumScanSlots] = { P_D7, P_E6, P_B4, P_B5 };
static const int8_t keyIndexTable[NumScanSlots] = { 0, 1, 2, 3 };

int main() {
  debugUart_initialize(38400);
  boardIo_setupLeds_proMicroAvr();
  oledDisplay_initialize();
  keyScanner_directWired_initialize(NumScanSlots, keyInputPins);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  keyboardMain_useVisualModule(oledDisplay_update);
  generalKeyboard_start();
  return 0;
}
