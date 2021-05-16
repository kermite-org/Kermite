#include "generalKeyboard.h"
#include "keyboardMain.h"
#include "km0/deviceIo/system.h"
#include <stdio.h>

void generalKeyboard_start() {
  system_initializeUserProgram();
  keyboardMain_initialize();
  system_enableInterrupts();

  uint32_t tick = 0;
  while (1) {
    if (tick % 4 == 0) {
      keyboardMain_udpateKeyScanners();
      keyboardMain_processKeyInputUpdate(4);
      keyboardMain_updateKeyInidicatorLed();
    }
    keyboardMain_updateHeartBeatLed(tick);
    keyboardMain_updateDisplayModules(tick);
    keyboardMain_processUpdate();
    delayMs(1);
    tick++;
  }
}
