
#include "rgbLighting.h"
#include "config.h"
#include "km0/base/utils.h"
#include "km0/device/serialLed.h"
#include "km0/kernel/commandDefinitions.h"
#include "km0/kernel/configManager.h"

#ifndef KM0_RGB_LIGHTING__NUM_LEDS
#error KM0_RGB_LIGHTING__NUM_LEDS is not defined
#endif

#define NumLeds KM0_RGB_LIGHTING__NUM_LEDS

//----------------------------------------------------------------------

static bool glowEnabled = false;
static uint8_t glowColor = 0;
static uint8_t glowBrightness = 0;
static uint32_t frameTick = 0;

static uint32_t colorBuf[NumLeds];

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

#define getR(x) ((x) >> 16 & 0xFF)
#define getG(x) ((x) >> 8 & 0xFF)
#define getB(x) ((x)&0xFF)

static uint8_t lerpElement(uint8_t e0, uint8_t e1, float p) {
  return (uint8_t)((1.0f - p) * e0 + p * e1);
}

static uint32_t lerpColor(uint32_t col0, uint32_t col1, float p) {
  uint8_t rr = lerpElement(getR(col0), getR(col1), p);
  uint8_t gg = lerpElement(getG(col0), getG(col1), p);
  uint8_t bb = lerpElement(getB(col0), getB(col1), p);
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
  for (int i = 0; i < NumLeds; i++) {
    serialLed_putPixel(0);
  }
}

//----------------------------------------------------------------------
//scene 0, fixed lighting

static void scene0_updateFrame() {
  uint32_t color = getCurrentColor();
  for (int i = 0; i < NumLeds; i++) {
    serialLed_putPixelWithAlpha(color, glowBrightness);
  }
}

//----------------------------------------------------------------------
//scene 1, breathing

static void scene1_updateFrame() {
  uint32_t color = getCurrentColor();
  int p = (frameTick << 3) & 0x1FF;
  int p2 = (p > 0x100) ? 0x200 - p : p;
  int bri = p2 * glowBrightness >> 8;
  for (int i = 0; i < NumLeds; i++) {
    serialLed_putPixelWithAlpha(color, bri);
  }
}

//----------------------------------------------------------------------
//scene 2, snake

static void scene2_updateFrame() {
  uint32_t color = getCurrentColor();
  int n = NumLeds;
  int p = (frameTick >> 1) % (n * 2);
  int activeIndex = (p > n) ? (2 * n - p) : p;
  for (int i = 0; i < NumLeds; i++) {
    serialLed_putPixelWithAlpha(i == activeIndex ? color : 0, glowBrightness);
  }
}

//----------------------------------------------------------------------
//scene 3, party

static void scene3_updateFrame() {
  if (frameTick % 20 == 0) {
    for (int i = 0; i < NumLeds; i++) {
      int colorIndex = pseudoRandom() % NumTableColors;
      uint32_t color = commonColorTable[colorIndex];
      colorBuf[i] = color;
    }
    for (int i = 0; i < NumLeds; i++) {
      serialLed_putPixelWithAlpha(colorBuf[i], glowBrightness);
    }
  }
}

//----------------------------------------------------------------------
//scene 4, gradation color transition

static const uint32_t scene4_period = 25 * 6;

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
  float p = phase2;
  if (p < 1.0f) {
    col0 = colorA;
    col1 = colorB;
  } else if (p < 2.0f) {
    p -= 1.0f;
    col0 = colorB;
    col1 = colorC;
  } else {
    p -= 2.0f;
    col0 = colorC;
    col1 = colorA;
  }

  for (int i = 0; i < NumLeds; i++) {
    float q = ((float)i / NumLeds);
    float p2 = 3.0f * p - q * 2.0f;
    // float p2 = 1.5f * p - q * 0.5f;
    uint32_t color = lerpColor(col0, col1, utils_clamp(p2, 0.0f, 1.0f));
    colorBuf[i] = color;
  }
  for (int i = 0; i < NumLeds; i++) {
    serialLed_putPixelWithAlpha(colorBuf[i], glowBrightness);
  }
}

//----------------------------------------------------------------------

typedef void (*SceneFunc)(void);

SceneFunc sceneFuncs[] = {
  scene0_updateFrame,
  scene1_updateFrame,
  scene2_updateFrame,
  scene3_updateFrame,
  scene4_updateFrame
};

static const int NumSceneFuncs = sizeof(sceneFuncs) / sizeof(SceneFunc);
static uint8_t glowPattern = 0;

static void parameterChangeHandler(uint8_t slotIndex, uint8_t value) {
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
    if (glowPattern < NumSceneFuncs) {
      sceneFuncs[glowPattern]();
    }
  }
}

void rgbLighting_initialize(uint8_t _pin, uint8_t _numLeds) {
  configManager_overrideParameterMaxValue(SystemParameter_GlowColor, 12);
  configManager_overrideParameterMaxValue(SystemParameter_GlowPattern, 4);
  configManager_addParameterChangeListener(parameterChangeHandler);
  serialLed_initialize(_pin);
}

void rgbLighting_update() {
  static uint32_t tick = 0;
  if (++tick % 40 == 0) {
    updateFrame();
    frameTick++;
  }
}