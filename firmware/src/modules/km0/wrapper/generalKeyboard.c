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
      keyboardMain_processKeyInputUpdate();
      keyboardMain_updateKeyInidicatorLed();
    }
    if (tick % 4 == 1) {
      keyboardMain_updatePointingDevice();
    }
    if (tick % 40 == 2) {
      keyboardMain_updateRgbLightingModules(tick);
    }
    if (tick % 48 == 3) {
      keyboardMain_updateOledDisplayModule(tick);
    }
    if (tick % 4000 == 3) {
      keyboardMain_taskFlashHeartbeatLed();
    }
    if (tick % 100 == 0) {
      keyboardMain_updateHostKeyboardStatusOutputModule();
    }
    keyboardMain_processUpdate();
    delayMs(1);
    tick++;
  }
}
