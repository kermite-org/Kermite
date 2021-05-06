#include "config.h"
#include "km0/deviceIo/dio.h"
#include "km0/deviceIo/serialLed.h"
#include "km0/keyboard/generalKeyboard.h"
#include "km0/keyboard/keyScanner_directWired.h"
#include "km0/keyboard/keyboardMain.h"
#include <stdio.h>

#define NumKeys 4
static const uint8_t keyInputPins[NumKeys] = { GP12, GP13, GP14, GP15 };
static const int8_t keyIndexTable[NumKeys] = { 0, 1, 2, 3 };

static bool glowEnabled = false;
static uint8_t glowColor = 0;
static uint8_t glowBrightness = 0;

static uint32_t colorTable[13] = {
  0xFF0000,
  0xFF4400,
  0xFFFF00,
  0x66FF00,
  0x00FF00,
  0x00FF44,
  0x00FFFF,
  0x0044FF,
  0x0000FF,
  0x4400FF,
  0xFF00FF,
  0xFF0044,
  0xFFFFFF
};

static void updateGlowLeds() {
  uint32_t rgb = colorTable[glowColor % 13];
  float p = (float)glowBrightness / 255;
  uint32_t alpha = (uint32_t)(p * p * 255);
  uint32_t argb = glowEnabled ? ((alpha << 24) | rgb) : 0;
  for (int i = 0; i < 4; i++) {
    serialLed_putPixelWithAlpha(argb);
  }
}

static void customParameterHandlerExtended(uint8_t slotIndex, uint8_t value) {
  if (slotIndex == 4) {
    glowEnabled = value;
    updateGlowLeds();
  } else if (slotIndex == 5) {
    glowColor = value;
    updateGlowLeds();
  } else if (slotIndex == 6) {
    glowBrightness = value;
    updateGlowLeds();
  }
}

static KeyboardCallbackSet callbacks = {
  .customParameterHandlerExtended = customParameterHandlerExtended
};

int main() {
  keyboardMain_useIndicatorLeds(GP25, GP25, false); //RPi pico
  keyboardMain_useDebugUart(38400);
  keyScanner_directWired_initialize(NumKeys, keyInputPins);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  keyboardMain_setCallbacks(&callbacks);
  serialLed_initialize(GP2);
  generalKeyboard_start();
  return 0;
}
