
#include "rgbLighting.h"
#include "km0/deviceIo/serialLed.h"
#include "km0/keyboard/keyboardMain.h"

static bool glowEnabled = false;
static uint8_t glowColor = 0;
static uint8_t glowBrightness = 0;
static uint8_t numLeds = 0;

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
  for (int i = 0; i < numLeds; i++) {
    serialLed_putPixelWithAlpha(argb);
  }
}

static void customParameterHandlerExtended(uint8_t slotIndex, uint8_t value) {
  if (slotIndex == 5) {
    glowEnabled = value;
  } else if (slotIndex == 6) {
    glowColor = value;
  } else if (slotIndex == 7) {
    glowBrightness = value;
  }
}

static KeyboardCallbackSet callbacks = {
  .customParameterHandlerExtended = customParameterHandlerExtended
};

void updateFrame() {
  updateGlowLeds();
}

void rgbLighting_initialize(uint8_t _pin, uint8_t _numLeds) {
  keyboardMain_setCallbacks(&callbacks);
  serialLed_initialize(_pin);
  numLeds = _numLeds;
}

void rgbLighting_update() {
  static uint32_t tick = 0;
  if (++tick % 40 == 0) {
    updateFrame();
  }
}