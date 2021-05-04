#include "generalKeyboard.h"
#include "config.h"
#include "keyboardMain.h"
#include "km0/common/bitOperations.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/system.h"
#include <stdio.h>

static bool debugUartConfigured = false;

void generalKeyboard_useIndicatorLeds(int8_t pin1, uint8_t pin2, bool invert) {
  boardIo_setupLeds(pin1, pin2, invert);
}

void generalKeyboard_useIndicatorRgbLed(int8_t pin) {
  boardIo_setupLedsRgb(pin);
}

void generalKeyboard_useDebugUart(uint32_t baud) {
  debugUart_setup(baud);
  debugUartConfigured = true;
}

void generalKeyboard_useKeyScanner(void (*_keyScannerUpdateFunc)(uint8_t *keyStateBitFlags)) {
  keyboardMain_useKeyScanner(_keyScannerUpdateFunc);
}

void generalKeyboard_useKeyScannerExtra(void (*_keyScannerUpdateFunc)(uint8_t *keyStateBitFlags)) {
  keyboardMain_useKeyScannerExtra(_keyScannerUpdateFunc);
}

void generalKeyboard_setKeyIndexTable(const int8_t *_scanIndexToKeyIndexMap) {
  keyboardMain_setKeyIndexTable(_scanIndexToKeyIndexMap);
}

void generalKeyboard_start() {
  system_initializeUserProgram();
  if (!debugUartConfigured) {
    debugUart_disable();
  }
  printf("start\n");
  keyboardMain_initialize();
  system_enableInterrupts();

  uint16_t cnt = 0;
  while (1) {
    cnt++;
    if (cnt % 4 == 0) {
      keyboardMain_udpateKeyScanners();
      keyboardMain_processKeyInputUpdate();
      if (optionAffectKeyHoldStateToLed) {
        boardIo_writeLed2(pressedKeyCount > 0);
      }
    }
    if (optionUseHeartbeatLed) {
      if (cnt % 4000 == 0) {
        boardIo_writeLed1(true);
      }
      if (cnt % 4000 == 4) {
        boardIo_writeLed1(false);
      }
    }
    delayMs(1);
    keyboardMain_processUpdate();
  }
}
