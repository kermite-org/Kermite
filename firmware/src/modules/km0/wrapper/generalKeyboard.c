#include "generalKeyboard.h"
#include "km0/device/system.h"
#include "km0/device/usbIoCore.h"
#include "km0/kernel/keyboardMainInternal.h"
#include <stdio.h>

void generalKeyboard_start() {
  system_initializeUserProgram();
  keyboardMain_initialize();
  usbIoCore_initialize();
  system_enableInterrupts();

  uint32_t tick = 0;
  while (1) {
    if (tick % 4 == 0) {
      keyboardMain_udpateKeyScanners();
      keyboardMain_processKeyInputUpdate(4);
      keyboardMain_updateKeyInidicatorLed();
    }
    if (tick % 40 == 1) {
      keyboardMain_updateRgbLightingModules(tick);
    }
    if (tick % 48 == 2) {
      keyboardMain_updateOledDisplayModule(tick);
    }
    if (tick % 4000 == 3) {
      keyboardMain_taskFlashHeartbeatLed();
    }
    keyboardMain_processUpdate();
    delayMs(1);
    tick++;
  }
}
