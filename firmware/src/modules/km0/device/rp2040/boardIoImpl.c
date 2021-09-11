
#include "km0/device/boardIo.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/commandDefinitions.h"
#include "km0/kernel/configManager.h"

static int8_t led_pins[2] = { -1, -1 };
static bool invert_output_logic = false;

static void handleBoardLedOperation(int index, int op) {
  int pin = led_pins[index];
  if (pin != -1) {
    if (op != LedOp_Toggle) {
      bool value = op == LedOp_TurnOn;
      digitalIo_write(pin, invert_output_logic ? !value : value);
    } else {
      digitalIo_toggle(pin);
    }
  }
}

void boardIoImpl_setupLeds(int8_t pin1, int8_t pin2, bool invert) {
  if (pin1 != -1) {
    digitalIo_setOutput(pin1);
    digitalIo_write(pin1, invert);
  }
  if (pin2 != -1) {
    digitalIo_setOutput(pin2);
    digitalIo_write(pin2, invert);
  }
  led_pins[0] = pin1;
  led_pins[1] = pin2;
  invert_output_logic = invert;
  boardIo_internal_setLedFunction(handleBoardLedOperation);
  configManager_setParameterExposeFlag(SystemParameter_HeartbeatLed);
  configManager_setParameterExposeFlag(SystemParameter_KeyHoldIndicatorLed);
}

void boardIoImpl_setupLeds_rpiPico() {
  boardIoImpl_setupLeds(GP25, GP25, false);
}

void boardIoImpl_setupLeds_tiny2040() {
  boardIoImpl_setupLeds(GP19, GP20, true);
  //red off
  digitalIo_setOutput(GP18);
  digitalIo_setHigh(GP18);
}