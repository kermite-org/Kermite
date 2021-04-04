// #include "hardware/gpio.h"
#include "pico/stdlib.h"

const int PIN_LED1 = 25;

const int PIN_OD = 28;

void initLED1() {
  gpio_init(PIN_LED1);
  gpio_set_dir(PIN_LED1, 1);
}

void turnOnLED1() {
  gpio_put(PIN_LED1, 1);
}

void turnOffLED1() {
  gpio_put(PIN_LED1, 0);
}

void odInit() {
  gpio_init(PIN_OD);
  gpio_pull_up(PIN_OD);
  gpio_set_dir(PIN_OD, 0);
}

void odHiZ() {
  gpio_set_dir(PIN_OD, 0);
}

void odDriveLow() {
  gpio_set_dir(PIN_OD, 1);
}

void main() {

  initLED1();
  odInit();

  while (1) {
    turnOnLED1();
    odHiZ();
    sleep_ms(1000);
    turnOffLED1();
    odDriveLow();
    sleep_ms(1000);
  }
}