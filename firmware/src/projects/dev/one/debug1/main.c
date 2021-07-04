#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include "km0/device/usbIoCore.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/kernel/keyboardMainInternal.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/wrapper/generalKeyboard.h"
#include <stdio.h>

static const uint8_t directWiredKeyInputPins[1] = { P_B5 };

void initBootButton() {
  digitalIo_setInputPullup(P_B6);
}

void taskBootButton() {
  bool isPressed = digitalIo_read(P_B6) == 0;
  if (isPressed) {
    system_jumpToDfuBootloader();
  }
}

void debug_generalKeyboard_start() {
  system_initializeUserProgram();
  keyboardMain_initialize();
  usbIoCore_initialize();
  system_enableInterrupts();

  initBootButton();

  uint32_t tick = 0;
  while (1) {
    if (tick % 4 == 0) {
      keyboardMain_udpateKeyScanners();
      keyboardMain_processKeyInputUpdate();
      keyboardMain_updateKeyInidicatorLed();
    }
    if (tick % 1000 == 0) {
      keyboardMain_taskFlashHeartbeatLed();
    }
    keyboardMain_processUpdate();
    taskBootButton();
    delayMs(1);
    tick++;
  }
}

int main() {
  boardIo_setupLeds_proMicroAvr();
  debugUart_initialize(38400);
  keyScanner_directWired_initialize(1, directWiredKeyInputPins, 0);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
  debug_generalKeyboard_start();
  return 0;
}
