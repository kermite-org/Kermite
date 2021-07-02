#include "km0/device/pinObserver.h"
#include "km0/base/bitOperations.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include "pico_sdk/src/rp2_common/include/hardware/gpio.h"

typedef void (*PinObserverCallback)(int, int);

static PinObserverCallback pin_observer_callbacks[32] = { 0 };

static void pinStateChangedHandlerRaw(uint pin, uint32_t events) {
  bool isRise = (events & GPIO_IRQ_EDGE_RISE) > 0;
  bool isFall = (events & GPIO_IRQ_EDGE_FALL) > 0;
  int edge = isFall ? PIN_OBSERVER_EDGE_FALL : PIN_OBSERVER_EDGE_RISE; //fallを優先
  if (pin_observer_callbacks[pin]) {
    pin_observer_callbacks[pin](pin, edge);
  }
  gpio_acknowledge_irq(pin, GPIO_IRQ_EDGE_RISE | GPIO_IRQ_EDGE_FALL);
}

void pinObserver_observePin(int pin, void (*callback)(int, int)) {
  pin_observer_callbacks[pin] = callback;
  gpio_set_irq_enabled_with_callback(pin, GPIO_IRQ_EDGE_RISE | GPIO_IRQ_EDGE_FALL, true, &pinStateChangedHandlerRaw);
}

void pinObserver_unobservePin(int pin) {
  gpio_set_irq_enabled(pin, GPIO_IRQ_EDGE_RISE | GPIO_IRQ_EDGE_FALL, false);
  pin_observer_callbacks[pin] = 0;
}