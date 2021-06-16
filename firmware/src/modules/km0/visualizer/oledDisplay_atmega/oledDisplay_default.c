#include "km0/base/configImport.h"
#include "km0/kernel/keyboardMainInternal.h"
#include "km0/visualizer/oledDisplay.h"
#include "oledCore.h"
#include <stdio.h>

#ifdef KM0_OLED_DISPLAY__NO_DEFAULT_LOGO
static __flash const uint32_t *mainLogoData = NULL;
#else
#include "km0/visualizer/oledLogoData.h"
static __flash const uint32_t *mainLogoData = oledLogoDataKermite;
#endif

#ifdef KM0_OLED_DISPLAY__NO_DEFAULT_FONT
__flash const uint8_t *mainFontData = NULL;
uint8_t mainFontWidth = 0;
uint8_t mainFontLetterSpacing = 0;
#else
#include "km0/visualizer/oledFontData.h"
__flash const uint8_t *mainFontData = oledFontData;
uint8_t mainFontWidth = oledFontWidth;
uint8_t mainFontLetterSpacing = oledFontLetterSpacing;
#endif

//----------------------------------------------------------------------

static uint8_t
getPressedKeyCode(const uint8_t *report) {
  for (int i = 2; i < 8; i++) {
    if (report[i] > 0) {
      return report[i];
    }
  }
  return 0;
}

static char strbuf[8];

#define pm(x) (x > 0 ? '+' : '-')

static const int SplashTickEnd = 60;
static uint8_t frameCount = 0;
static uint8_t splashTick = 0;

static void renderStatusView() {
  if (!mainFontData) {
    return;
  }

  oledCore_putText(0, 0, "Status");

  KeyboardMainExposedState *exposedState = &keyboardMain_exposedState;

  //hid key slots
  const uint8_t *b = exposedState->hidReportBuf;
  sprintf(strbuf, "%c%c%c%c%c%c", pm(b[2]), pm(b[3]), pm(b[4]), pm(b[5]), pm(b[6]), pm(b[7]));
  oledCore_putText(0, 15, strbuf);

  //key index
  uint8_t ki = exposedState->pressedKeyIndex;

  if (ki != KEYINDEX_NONE) {
    //keycode
    uint8_t kc = getPressedKeyCode(exposedState->hidReportBuf);
    //modifiers
    uint8_t m = exposedState->hidReportBuf[0];

    sprintf(strbuf, "KI:%d", ki);
    oledCore_putText(3, 0, strbuf);
    sprintf(strbuf, "KC:%d", kc);
    oledCore_putText(3, 6, strbuf);
    sprintf(strbuf, "M:%x", m);
    oledCore_putText(3, 13, strbuf);
  } else {
    sprintf(strbuf, "KI:  ");
    oledCore_putText(3, 0, strbuf);
    sprintf(strbuf, "KC:  ");
    oledCore_putText(3, 6, strbuf);
    sprintf(strbuf, "M:  ");
    oledCore_putText(3, 13, strbuf);
  }

  //layers
  uint8_t lsf = exposedState->layerStateFlags;
  sprintf(strbuf, "L:%x", lsf);
  oledCore_putText(3, 18, strbuf);

  //debug
  // sprintf(strbuf, "%d", frameCount);
  // oledCore_putText(0, 8, strbuf);

  oledCore_renderFullTexts();

  frameCount++;
}

static void renderMainLogo() {
  if (mainLogoData) {
    oledCore_renderFullImage(mainLogoData);
  } else {
    oledCore_renderClear();
  }
}

static void updateFrame() {
  if (splashTick == 0) {
    renderMainLogo();
    splashTick++;
    return;
  }
  bool isMaster = !keyboardMain_exposedState.isSplitSlave;
  if (isMaster) {
    if (splashTick < SplashTickEnd) {
      splashTick++;
    } else if (splashTick == SplashTickEnd) {
      oledCore_renderClear();
      splashTick++;
    } else {
      renderStatusView();
    }
  }
}

//----------------------------------------------------------------------

void oledDisplay_setCustomLogo(__flash const uint32_t *logoData) {
  mainLogoData = logoData;
}

void oledDisplay_setCustomFont(__flash const uint8_t *fontData, uint8_t fontWidth, uint8_t fontLetterSpacing) {
  mainFontData = fontData;
  mainFontWidth = fontWidth;
  mainFontLetterSpacing = fontLetterSpacing;
}

void oledDisplay_initialize() {
  oledCore_initialize();
  oledCore_setFontData(mainFontData, mainFontWidth, mainFontLetterSpacing);
}

void oledDisplay_update() {
  updateFrame();
}
