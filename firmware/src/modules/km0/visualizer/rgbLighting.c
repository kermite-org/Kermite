
#include "rgbLighting.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/serialLed.h"
#include "km0/keyboard/commandDefinitions.h"
#include "km0/keyboard/keyboardMain.h"

//----------------------------------------------------------------------

static bool glowEnabled = false;
static uint8_t glowColor = 0;
static uint8_t glowBrightness = 0;
static uint8_t numLeds = 0;

static uint32_t frameTick = 0;

#define NumTableColors 13

static uint32_t commonColorTable[NumTableColors] = {
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

static uint32_t getCurrentColor() {
  int colorIndex = glowColor < NumTableColors ? glowColor : 0;
  return commonColorTable[colorIndex];
}

static uint32_t pseudoRandom() {
  static uint32_t val = 345234;
  val = (51345613 * val) + 11;
  return val;
}

//----------------------------------------------------------------------
//blank output
static void scene_fallbackBlank_updateFrame() {
  for (int i = 0; i < numLeds; i++) {
    serialLed_putPixel(0);
  }
}

//----------------------------------------------------------------------
//scene 0

static void scene0_updateFrame() {
  uint32_t color = getCurrentColor();
  for (int i = 0; i < numLeds; i++) {
    serialLed_putPixelWithAlpha(color, glowBrightness);
  }
}

//----------------------------------------------------------------------
//scene 1

static void scene1_updateFrame() {
  uint32_t color = getCurrentColor();
  int p = (frameTick << 3) & 0x1FF;
  int p2 = (p > 0x100) ? 0x200 - p : p;
  int bri = p2 * glowBrightness >> 8;
  for (int i = 0; i < numLeds; i++) {
    serialLed_putPixelWithAlpha(color, bri);
  }
}

//----------------------------------------------------------------------
//scene 2

static void scene2_updateFrame() {
  uint32_t color = getCurrentColor();
  int n = numLeds;
  int p = (frameTick >> 1) % (n * 2);
  int activeIndex = (p > n) ? (2 * n - p) : p;
  for (int i = 0; i < numLeds; i++) {
    serialLed_putPixelWithAlpha(i == activeIndex ? color : 0, glowBrightness);
  }
}

//----------------------------------------------------------------------
//scene 3

static void scene3_updateFrame() {
  if (frameTick % 40 == 0) {
    for (int i = 0; i < numLeds; i++) {
      int colorIndex = pseudoRandom() % NumTableColors;
      uint32_t color = commonColorTable[colorIndex];
      serialLed_putPixelWithAlpha(color, glowBrightness);
    }
  }
}

//----------------------------------------------------------------------

typedef void (*SceneFunc)(void);

SceneFunc sceneFuncs[] = {
  scene0_updateFrame,
  scene1_updateFrame,
  scene2_updateFrame,
  scene3_updateFrame
};

static const int NumSceneFuncs = sizeof(sceneFuncs) / sizeof(SceneFunc);
static uint8_t glowPattern = 0;

static void customParameterHandlerExtended(uint8_t slotIndex, uint8_t value) {
  if (slotIndex == SystemParameter_GlowActive) {
    glowEnabled = value;
  } else if (slotIndex == SystemParameter_GlowColor) {
    glowColor = value;
  } else if (slotIndex == SystemParameter_GlowBrightness) {
    glowBrightness = value;
  } else if (slotIndex == SystemParameter_GlowPattern) {
    glowPattern = value;
  }
}

static KeyboardCallbackSet callbacks = {
  .customParameterHandlerExtended = customParameterHandlerExtended
};

static void updateFrame() {
  if (!glowEnabled) {
    scene_fallbackBlank_updateFrame();
  } else {
    if (glowPattern < NumSceneFuncs) {
      sceneFuncs[glowPattern]();
    }
  }
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
    frameTick++;
  }
}