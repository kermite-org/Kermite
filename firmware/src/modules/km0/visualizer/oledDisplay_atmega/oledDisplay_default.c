#include "config.h"
#include "km0/base/bitOperations.h"
#include "km0/base/romData.h"
#include "km0/base/utils.h"
#include "km0/device/boardI2c.h"
#include "km0/device/boardIo.h"
#include "km0/device/system.h"
#include "km0/kernel/keyboardMainInternal.h"
#include "km0/visualizer/oledDisplay.h"
#include "oledCore.h"
#include <stdio.h>
#include <string.h>

#ifdef KM0_OLED_DISPLAY__NO_DEFAULT_LOGO
static const uint32_t *mainLogoData = NULL;
#else
#include "km0/visualizer/oledLogoData.h"
static const uint32_t *mainLogoData = oledLogoDataKermite;
#endif

#ifdef KM0_OLED_DISPLAY__NO_DEFAULT_FONT
const uint8_t *mainFontData = NULL;
uint8_t mainFontWidth = 0;
uint8_t mainFontLetterSpacing = 0;
#else
#include "km0/visualizer/oledFontData.h"
const uint8_t *mainFontData = oledFontData;
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

static void renderStatusView() {
  if (!mainFontData) {
    oledCore_clear();
    return;
  }

  oledCore_clearTexts();

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
    sprintf(strbuf, "KI:");
    oledCore_putText(3, 0, strbuf);
    sprintf(strbuf, "KC:");
    oledCore_putText(3, 6, strbuf);
    sprintf(strbuf, "M:");
    oledCore_putText(3, 13, strbuf);
  }

  //layers
  uint8_t lsf = exposedState->layerStateFlags;
  sprintf(strbuf, "L:%x", lsf);
  oledCore_putText(3, 18, strbuf);

  oledCore_drawFullTexts();
}

//----------------------------------------------------------------------

static void renderMainLogo() {
  if (mainLogoData) {
    oledCore_drawFullImage(mainLogoData);
  } else {
    oledCore_clear();
  }
}

void oledDisplay_setCustomLogo(const uint32_t *logoData) {
  mainLogoData = logoData;
}

void oledDisplay_setCustomFont(const uint8_t *fontData, uint8_t fontWidth, uint8_t fontLetterSpacing) {
  mainFontData = fontData;
  mainFontWidth = fontWidth;
  mainFontLetterSpacing = fontLetterSpacing;
}

void oledDisplay_initialize() {
  oledCore_initialize();
  oledCore_setFontData(mainFontData, mainFontWidth, mainFontLetterSpacing);
}

static void updateFrame() {
  static int cnt = 60;
  if (cnt > 0) {
    cnt--;
  }
  bool bootComplete = cnt == 0;
  bool isMaster = !keyboardMain_exposedState.isSplitSlave;
  if (bootComplete && isMaster) {
    renderStatusView();
  } else {
    renderMainLogo();
  }
}

void oledDisplay_update() {
  static uint32_t tick = 0;
  if (++tick % 50 == 0) {
    updateFrame();
  }
}
