#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/visualizer/oledDisplay.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumScanSlots 4

static const uint8_t keyInputPins[NumScanSlots] = { GP12, GP13, GP14, GP15 };

static const int8_t keyIndexTable[NumScanSlots] = { 0, 1, 2, 3 };

int main() {
  boardIo_setupLeds_rpiPico();
  oledDisplay_initialize();
  keyScanner_directWired_initialize(NumScanSlots, keyInputPins);
  keyboardMain_useDebugUart(115200);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  keyboardMain_useDisplayModule(oledDisplay_update);
  generalKeyboard_start();
  return 0;
}
