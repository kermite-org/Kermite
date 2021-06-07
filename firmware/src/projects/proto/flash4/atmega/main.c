#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/serialLed.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/visualizer/rgbLighting.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumKeys 4
static const uint8_t keyInputPins[NumKeys] = { P_D7, P_E6, P_B4, P_B5 };
static const int8_t keyIndexTable[NumKeys] = { 0, 1, 2, 3 };

int main() {
  debugUart_initialize(38400);
  boardIo_setupLeds_proMicroAvr();
  rgbLighting_initialize();
  keyScanner_directWired_initialize(NumKeys, keyInputPins);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  generalKeyboard_start();
  return 0;
}
