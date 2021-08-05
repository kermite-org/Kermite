#include "km0/base/utils.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include <stdio.h>

//board ProMicro
//D0, D1, D4: extenral LEDs

typedef struct {
  uint8_t data_header[4];
  uint8_t pin_ex_led;
} KermiteKeyboardDefinitionData;

KermiteKeyboardDefinitionData keyboard_defs = {
  .data_header = { 0x4B, 0x4D, 0x44, 0x46 }, //K,M,D,F
  .pin_ex_led = P_D1
};

void blink() {
  uint8_t pin_ex_led = keyboard_defs.pin_ex_led;
  boardIo_setupLeds_proMicroAvr();
  digitalIo_setOutput(pin_ex_led);

  while (1) {
    boardIo_toggleLed1();
    digitalIo_toggle(pin_ex_led);
    delayMs(500);
  }
}

int main() {
  system_initializeUserProgram();
  blink();
  return 0;
}
