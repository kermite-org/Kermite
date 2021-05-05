#include "generalKeyboard.h"
#include "keyboardMain.h"
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/system.h"
#include <stdio.h>

void generalKeyboard_start() {
  system_initializeUserProgram();
  keyboardMain_initialize();
  printf("start\n");
  system_enableInterrupts();

  uint32_t tick = 0;
  while (1) {
    if (tick % 4 == 0) {
      keyboardMain_udpateKeyScanners();
      keyboardMain_processKeyInputUpdate();
      if (optionAffectKeyHoldStateToLed) {
        boardIo_writeLed2(pressedKeyCount > 0);
      }
    }
    if (optionUseHeartbeatLed) {
      if (tick % 4000 == 0) {
        boardIo_writeLed1(true);
      }
      if (tick % 4000 == 4) {
        boardIo_writeLed1(false);
      }
    }
    tick++;
    delayMs(1);
    keyboardMain_processUpdate();
  }
}
