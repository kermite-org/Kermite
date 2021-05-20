#include "config.h"
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/digitalIo.h"
#include "km0/deviceIo/serialLed.h"
#include "km0/keyboard/generalKeyboard.h"
#include "km0/keyboard/keyScanner_directWired.h"
#include "km0/keyboard/keyboardMain.h"
#include "km0/visualizer/rgbLighting.h"
#include <stdio.h>

#define NumKeys 4
static const uint8_t keyInputPins[NumKeys] = { GP12, GP13, GP14, GP15 };
static const int8_t keyIndexTable[NumKeys] = { 0, 1, 2, 3 };

int main() {
  rgbLighting_initialize(GP28, NumKeys);
  keyScanner_directWired_initialize(NumKeys, keyInputPins);
  boardIo_setupLeds_rpiPico();
  keyboardMain_useDebugUart(115200);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  keyboardMain_useDisplayModule(rgbLighting_update);
  generalKeyboard_start();
  return 0;
}
