#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/serialLed.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/visualizer/rgbLighting.h"
#include "km0/wrapper/generalKeyboard.h"
#include <stdio.h>

#define NumKeys 4
static const uint8_t keyInputPins[NumKeys] = { GP12, GP13, GP14, GP15 };
static const int8_t keyIndexTable[NumKeys] = { 0, 1, 2, 3 };

int main() {
  debugUart_initialize(115200);
  rgbLighting_initialize();
  keyScanner_directWired_initialize(NumKeys, keyInputPins);
  boardIo_setupLeds_rpiPico();
  keyboardMain_setKeyIndexTable(keyIndexTable);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
  keyboardMain_useVisualModule(rgbLighting_update);
  generalKeyboard_start();
  return 0;
}
