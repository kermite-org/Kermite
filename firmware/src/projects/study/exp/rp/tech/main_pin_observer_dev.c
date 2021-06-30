#include "km0/base/utils.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include "pico_sdk/src/rp2_common/include/hardware/gpio.h"
#include <stdio.h>

static void pin_state_listener(uint gpio, uint32_t events) {
  printf("%d %d\n", gpio, events);
}

void main() {
  debugUart_initialize(38400);
  printf("start\n");
  boardIo_setupLeds_rpiPico();

  digitalIo_setInputPullup(GP15);
  digitalIo_setInputPullup(GP16);
  gpio_set_irq_enabled_with_callback(15, GPIO_IRQ_EDGE_RISE | GPIO_IRQ_EDGE_FALL, true, &pin_state_listener);
  gpio_set_irq_enabled_with_callback(16, GPIO_IRQ_EDGE_RISE | GPIO_IRQ_EDGE_FALL, true, &pin_state_listener);

  uint32_t cnt = 0;
  while (1) {
    if (cnt % 1000 == 0) {
      boardIo_toggleLed1();
    }
    cnt++;
    delayMs(1);
  }
}