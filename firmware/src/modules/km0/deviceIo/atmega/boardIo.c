
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/digitalIo.h"

static int8_t pin_led1 = -1;
static int8_t pin_led2 = -1;
static bool invert_output_logic = false;

void boardIo_setupLeds(int8_t pin1, int8_t pin2, bool invert) {
  pin_led1 = pin1;
  pin_led2 = pin2;
  invert_output_logic = invert;
  if (pin_led1 != -1) {
    digitalIo_setOutput(pin_led1);
    digitalIo_write(pin_led1, invert);
  }
  if (pin_led2 != -1) {
    digitalIo_setOutput(pin_led2);
    digitalIo_write(pin_led2, invert);
  }
}

void boardIo_writeLed1(bool value) {
  if (pin_led1 != -1) {
    digitalIo_write(pin_led1, invert_output_logic ? !value : value);
  }
}

void boardIo_writeLed2(bool value) {
  if (pin_led2 != -1) {
    digitalIo_write(pin_led2, invert_output_logic ? !value : value);
  }
}

void boardIo_toggleLed1() {
  if (pin_led1 != -1) {
    digitalIo_toggle(pin_led1);
  }
}

void boardIo_toggleLed2() {
  if (pin_led2 != -1) {
    digitalIo_toggle(pin_led2);
  }
}

void boardIo_setupLeds_proMicroAvr() {
  boardIo_setupLeds(P_B0, P_D5, true);
}
