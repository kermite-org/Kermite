#include "km0/deviceIo/dio.h"
#include "pico/stdlib.h"

void dio_setOutput(uint8_t pin) {
  gpio_init(pin);
  gpio_set_dir(pin, GPIO_OUT);
}

void dio_setInput(uint8_t pin) {
  gpio_init(pin);
  gpio_set_dir(pin, GPIO_IN);
}

void dio_setInputPullup(uint8_t pin) {
  gpio_init(pin);
  gpio_pull_up(pin);
  gpio_set_dir(pin, GPIO_IN);
}

void dio_write(uint8_t pin, bool val) {
  gpio_put(pin, val);
}

bool dio_read(uint8_t pin) {
  return gpio_get(pin);
}

void dio_toggle(uint8_t pin) {
  gpio_put(pin, !gpio_get(pin));
}

void dio_setHigh(uint8_t pin) {
  gpio_put(pin, 1);
}

void dio_setLow(uint8_t pin) {
  gpio_put(pin, 0);
}