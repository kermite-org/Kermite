#include "keyboardStatusLeds.h"
#include "km0/base/bitOperations.h"
#include "km0/base/configImport.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMainInternal.h"

#ifndef KM0_KEYBOARD_STATUS_LEDS__LED_PINS
#error KM0_KEYBOARD_STATUS_LEDS__PINS is not defined
#endif

static const int pin_status_leds[3] = KM0_KEYBOARD_STATUS_LEDS__LED_PINS;

#ifdef KM0_KEYBOARD_STATUS_LEDS__LED_DRIVE_MODE_SINK
static const bool led_drive_mode_sink = true;
#else
static const bool led_drive_mode_sink = false;
#endif

static void outputStatusLed(int index, bool state) {
  digitalIo_write(pin_status_leds[index], led_drive_mode_sink ? (!state) : state);
}

void keyboardStatusLeds_initialize() {
  for (int i = 0; i < 3; i++) {
    digitalIo_setOutput(pin_status_leds[i]);
    outputStatusLed(i, false);
  }
}

void keyboardStatusLeds_update() {
  uint8_t flags = keyboardMain_exposedState.hostKeyboardStateFlags;
  for (int i = 0; i < 3; i++) {
    outputStatusLed(i, bit_read(flags, i));
  }
}
