
#include "boardLED.h"
#include "dio.h"
#include "types.h"

static int8_t led_pin1 = -1;
static int8_t led_pin2 = -1;
static bool led_invert = false;

void boardLED_initLEDs(int8_t pin1, int8_t pin2, bool invert) {
  led_pin1 = pin1;
  led_pin2 = pin2;
  led_invert = invert;
  if (led_pin1 != -1) {
    dio_setOutput(led_pin1);
    dio_write(led_pin1, invert);
  }
  if (led_pin2 != -1) {
    dio_setOutput(led_pin2);
    dio_write(led_pin2, invert);
  }
}

void boardLED_initRgbLED(int8_t pin) {}

void boardLED_outputLED1(bool value) {
  if (led_pin1 != -1) {
    dio_write(led_pin1, led_invert ? !value : value);
  }
}

void boardLED_outputLED2(bool value) {
  if (led_pin2 != -1) {
    dio_write(led_pin2, led_invert ? !value : value);
  }
}
