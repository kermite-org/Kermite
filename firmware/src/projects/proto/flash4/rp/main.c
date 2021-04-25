#include "config.h"
#include "km0/deviceIo/dio.h"
#include "km0/deviceIo/serialLed.h"
#include "km0/keyboard/generalKeyboard.h"
#include "km0/keyboard/keyScanner.h"
#include <stdio.h>

#define NumKeys 4
static const uint8_t keyInputPins[NumKeys] = { GP12, GP13, GP14, GP15 };
static const int8_t keyIndexTable[NumKeys] = { 0, 1, 2, 3 };

void customParameterHandlerChained(uint8_t slotIndex, uint8_t value) {
  if (slotIndex == 4) {
    uint32_t color = value ? 0x10FF00FF : 0;
    for (int i = 0; i < 4; i++) {
      serialLed_putPixel(color);
    }
  }
}

KeyboardCallbackSet callbacks = {
  .customParameterHandlerChained = customParameterHandlerChained
};

int main() {
  serialLed_initialize(GP2);
  generalKeyboard_useOptionFixed(0, true);
  generalKeyboard_useOptionFixed(1, true);
  generalKeyboard_useIndicatorLeds(GP25, GP25, false); //RPi pico
  generalKeyboard_useDebugUart(38400);
  keyScanner_initializeDirectWired(NumKeys, keyInputPins);
  generalKeyboard_setKeyIndexTable(keyIndexTable);
  generalKeyboard_setCallbacks(&callbacks);
  generalKeyboard_start();
  return 0;
}
