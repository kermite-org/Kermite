#include "config.h"
#include "km0/deviceIo/dio.h"
#include "km0/keyboard/generalKeyboard.h"
#include "km0/keyboard/keyScanner_directWired.h"
#include "km0/keyboard/keyboardMain.h"
#include "km0/visualizer/oledDisplay.h"

#define NumScanSlots 4

static const uint8_t keyInputPins[NumScanSlots] = { GP12, GP13, GP14, GP15 };

static const int8_t keyIndexTable[NumScanSlots] = { 0, 1, 2, 3 };

int main() {
  oledDisplay_initialize();
  keyScanner_directWired_initialize(NumScanSlots, keyInputPins);
  keyboardMain_useDebugUart(115200);
  keyboardMain_useIndicatorLeds(GP25, GP25, false);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  keyboardMain_useDisplayModule(oledDisplay_update);
  generalKeyboard_start();
  return 0;
}
