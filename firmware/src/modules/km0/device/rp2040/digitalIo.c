#include "km0/device/digitalIo.h"
#include "pico_sdk/src/common/include/pico/stdlib.h"

void digitalIo_setOutput(uint8_t pin) {
  gpio_init(pin);
  gpio_set_dir(pin, GPIO_OUT);
}

void digitalIo_setInput(uint8_t pin) {
  gpio_init(pin);
  gpio_set_dir(pin, GPIO_IN);
}

void digitalIo_setInputPullup(uint8_t pin) {
  gpio_init(pin);
  gpio_pull_up(pin);
  gpio_set_dir(pin, GPIO_IN);
}

void digitalIo_write(uint8_t pin, bool val) {
  gpio_put(pin, val);
}

bool digitalIo_read(uint8_t pin) {
  return gpio_get(pin);
}

void digitalIo_toggle(uint8_t pin) {
  gpio_put(pin, !gpio_get(pin));
}

void digitalIo_setHigh(uint8_t pin) {
  gpio_put(pin, 1);
}

void digitalIo_setLow(uint8_t pin) {
  gpio_put(pin, 0);
}