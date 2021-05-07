#include "km0/common/bitOperations.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/boardI2c.h"
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/system.h"
#include "km0/keyboard/keyboardMain.h"
#include "km0/visualizer/oledDisplay.h"
#include "km0/visualizer/oledFontData.h"
#include "km0/visualizer/oledLogoData.h"
#include "oledCoreEx.h"
#include <stdio.h>
#include <string.h>

//----------------------------------------------------------------------

static uint8_t getPressedKeyCode(const uint8_t *report) {
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
  oledCoreEx_graphics_clear();

  oledCoreEx_graphics_drawText(0, 0, "Status");

  //hid key slots
  const uint8_t *b = exposedState.hidReportBuf;
  sprintf(strbuf, "%c%c%c%c%c%c", pm(b[2]), pm(b[3]), pm(b[4]), pm(b[5]), pm(b[6]), pm(b[7]));
  oledCoreEx_graphics_drawText(0, 15, strbuf);

  //key index
  uint8_t ki = exposedState.pressedKeyIndex;

  if (ki != KEYINDEX_NONE) {
    //keycode
    uint8_t kc = getPressedKeyCode(exposedState.hidReportBuf);
    //modifiers
    uint8_t m = exposedState.hidReportBuf[0];

    sprintf(strbuf, "KI:%d", ki);
    oledCoreEx_graphics_drawText(3, 0, strbuf);
    sprintf(strbuf, "KC:%d", kc);
    oledCoreEx_graphics_drawText(3, 6, strbuf);
    sprintf(strbuf, "M:%x", m);
    oledCoreEx_graphics_drawText(3, 13, strbuf);
  } else {
    sprintf(strbuf, "KI:");
    oledCoreEx_graphics_drawText(3, 0, strbuf);
    sprintf(strbuf, "KC:");
    oledCoreEx_graphics_drawText(3, 6, strbuf);
    sprintf(strbuf, "M:");
    oledCoreEx_graphics_drawText(3, 13, strbuf);
  }

  //layers
  uint8_t lsf = exposedState.layerStateFlags;
  sprintf(strbuf, "L:%x", lsf);
  oledCoreEx_graphics_drawText(3, 18, strbuf);

  oledCoreEx_flushScreen();
}

static void renderKermiteLogo() {
  oledCoreEx_graphics_clear();
  oledCoreEx_graphics_drawFullImage(oledLogoDataKermite);
  oledCoreEx_flushScreen();
}

//----------------------------------------------------------------------

void oledDisplay_initialize() {
  oledCoreEx_initialize();
  oledCoreEx_graphics_setFontData(oledFontData, oledFontWidth, oledFontLetterSpacing);
  delayMs(10);
}

static void updateFrame() {
  static int cnt = 60;
  if (cnt > 0) {
    cnt--;
  }
  bool bootComplete = cnt == 0;
  bool isMaster = !exposedState.isSplitSlave;
  if (bootComplete && isMaster) {
    renderStatusView();
  } else {
    renderKermiteLogo();
  }
}

void oledDisplay_update() {
  static uint32_t tick = 0;
  if (++tick % 50 == 0) {
    updateFrame();
  }
}
