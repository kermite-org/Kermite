
#include "rgbLighting.h"
#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "km0/device/serialLed.h"
#include "km0/device/system.h"
#include "km0/kernel/commandDefinitions.h"
#include "km0/kernel/configManager.h"

//----------------------------------------------------------------------

static uint8_t numLeds = 0;

static bool glowEnabled = false;
static uint8_t glowColor = 0;
static uint8_t glowBrightness = 0;
static uint32_t frameTick = 0;

#define NumTableColors 13

__flash static const uint32_t commonColorTable[NumTableColors] = {
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

static uint16_t pseudoRandom() {
  static uint16_t val = 3459;
  val = (5613 * val) + 17;
  return val;
}

#define getR(x) ((x) >> 16 & 0xFF)
#define getG(x) ((x) >> 8 & 0xFF)
#define getB(x) ((x)&0xFF)

static uint8_t lerpElement(uint8_t e0, uint8_t e1, uint8_t m) {
  return ((255 - m) * (uint16_t)e0 + m * (uint16_t)e1) >> 8;
}

static uint32_t lerpColor(uint32_t col0, uint32_t col1, uint8_t m) {
  uint8_t rr = lerpElement(getR(col0), getR(col1), m);
  uint8_t gg = lerpElement(getG(col0), getG(col1), m);
  uint8_t bb = lerpElement(getB(col0), getB(col1), m);
  return (uint32_t)rr << 16 | (uint32_t)gg << 8 | bb;
}

static uint32_t shiftRgb(uint32_t col, uint8_t shift) {
  if (shift == 1) {
    return (col >> 8) | ((col & 0xFF) << 16);
  } else if (shift == 2) {
    return (col >> 16) | ((col & 0xFFFF) << 8);
  }
  return col;
}

//----------------------------------------------------------------------
//blank output

static void scene_fallbackBlank_updateFrame() {
  system_disableInterrupts();
  for (int i = 0; i < numLeds; i++) {
    serialLed_putPixel(0);
  }
  system_enableInterrupts();
}

//----------------------------------------------------------------------
//scene 0, fixed lighting

static void scene0_updateFrame() {
  uint32_t color = getCurrentColor();
  system_disableInterrupts();
  for (int i = 0; i < numLeds; i++) {
    serialLed_putPixelWithAlpha(color, glowBrightness);
  }
  system_enableInterrupts();
}

//----------------------------------------------------------------------
//scene 1, breathing

static void scene1_updateFrame() {
  uint32_t color = getCurrentColor();
  int p = (frameTick << 3) & 0x1FF;
  int p2 = (p > 0x100) ? 0x200 - p : p;
  int bri = p2 * glowBrightness >> 8;
  system_disableInterrupts();
  for (int i = 0; i < numLeds; i++) {
    serialLed_putPixelWithAlpha(color, bri);
  }
  system_enableInterrupts();
}

//----------------------------------------------------------------------
//scene 2, snake

static void scene2_updateFrame() {
  uint32_t color = getCurrentColor();
  int n = numLeds;
  int p = (frameTick >> 1) % (n * 2);
  int activeIndex = (p > n) ? (2 * n - p) : p;
  system_disableInterrupts();
  for (int i = 0; i < numLeds; i++) {
    serialLed_putPixelWithAlpha(i == activeIndex ? color : 0, glowBrightness);
  }
  system_enableInterrupts();
}

//----------------------------------------------------------------------
//scene 3, party

static void scene3_updateFrame() {
  if (frameTick % 20 == 0) {
    system_disableInterrupts();
    for (int i = 0; i < numLeds; i++) {
      int colorIndex = (uint8_t)(pseudoRandom() & 0xFF) % NumTableColors;
      uint32_t color = commonColorTable[colorIndex];
      serialLed_putPixelWithAlpha(color, glowBrightness);
    }
    system_enableInterrupts();
  }
}

//----------------------------------------------------------------------
//scene 4, gradation color transition

static const uint32_t scene4_period = 150;

static void scene4_updateFrame() {
  float phase = (float)(frameTick % scene4_period) / scene4_period; //0~1

  uint32_t colorA = getCurrentColor();
  if (colorA == 0xFFFFFF) {
    colorA = 0xFFFF88;
  }
  uint32_t colorB = shiftRgb(colorA, 1);
  uint32_t colorC = shiftRgb(colorA, 2);

  float phase2 = phase * 3.0f;
  uint32_t col0, col1;
  float _p = phase2;
  if (_p < 1.0f) {
    col0 = colorA;
    col1 = colorB;
  } else if (_p < 2.0f) {
    _p -= 1.0f;
    col0 = colorB;
    col1 = colorC;
  } else {
    _p -= 2.0f;
    col0 = colorC;
    col1 = colorA;
  }

  //_p: 0~1
  uint8_t p = (uint8_t)(_p * 256); //0~255
  uint16_t _divNumLeds = 65536 / numLeds;
  system_disableInterrupts();
  for (uint8_t i = 0; i < numLeds; i++) {
    // float q = (float)i * _divNumLeds;
    // float p2 = 3.0f * _p - q * 2.0f;
    // flot m = utils_clamp(p2, 0.0f, 1.0f);
    uint16_t q = i * _divNumLeds >> 8; //0~255
    int16_t p2 = 3 * (int16_t)p - (int16_t)q * 2;
    uint8_t m = utils_clamp(p2, 0, 255);
    uint32_t color = lerpColor(col0, col1, m);
    serialLed_putPixelWithAlpha(color, glowBrightness);
  }
  system_enableInterrupts();
}

//----------------------------------------------------------------------

typedef void (*SceneFunc)(void);

__flash static const SceneFunc sceneFuncs[] = {
  scene0_updateFrame,
  scene1_updateFrame,
  scene2_updateFrame,
  scene3_updateFrame,
  scene4_updateFrame
};

static const int NumSceneFuncs = sizeof(sceneFuncs) / sizeof(SceneFunc);
static uint8_t glowPattern = 0;

static void parameterChangeHandler(uint8_t eventType, uint8_t slotIndex, uint8_t value) {
  if (eventType == ParameterChangeEventType_ChangedAll) {
    configManager_dispatchSingleParameterChangedEventsAll(parameterChangeHandler);
    return;
  }

  if (slotIndex == SystemParameter_GlowActive) {
    glowEnabled = value;
  } else if (slotIndex == SystemParameter_GlowColor) {
    glowColor = value;
  } else if (slotIndex == SystemParameter_GlowBrightness) {
    glowBrightness = (((uint16_t)value * value) >> 8) + 1; //apply A curve
  } else if (slotIndex == SystemParameter_GlowPattern) {
    glowPattern = value;
  }
}

static void updateFrame() {
  if (!glowEnabled) {
    scene_fallbackBlank_updateFrame();
  } else {
    if (glowPattern < NumSceneFuncs && numLeds > 0) {
      sceneFuncs[glowPattern]();
    }
  }
}

void rgbLighting_preConfigure() {
  configManager_setParameterExposeFlag(SystemParameter_GlowActive);
  configManager_setParameterExposeFlag(SystemParameter_GlowColor);
  configManager_setParameterExposeFlag(SystemParameter_GlowBrightness);
  configManager_setParameterExposeFlag(SystemParameter_GlowPattern);
  configManager_overrideParameterMaxValue(SystemParameter_GlowColor, 12);
  configManager_overrideParameterMaxValue(SystemParameter_GlowPattern, 4);
}

void rgbLighting_initialize(int8_t pin) {
  configManager_addParameterChangeListener(parameterChangeHandler);
  serialLed_initialize(pin);
}

void rgbLighting_setNumLeds(uint8_t _numLeds) {
  numLeds = _numLeds;
}

void rgbLighting_update() {
  frameTick = system_getSystemTimeMs() >> 6;
  updateFrame();
}