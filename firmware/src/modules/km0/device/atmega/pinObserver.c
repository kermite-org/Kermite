#include "km0/device/pinObserver.h"
#include "km0/base/bitOperations.h"
#include "km0/device/digitalIo.h"
#include <avr/interrupt.h>

static uint8_t observed_pin_flags = 0;
static uint8_t prev_portb = 0;

typedef void (*PinObserverCallback)(int, int);

static PinObserverCallback pin_observer_callbacks[8] = { 0 };

ISR(PCINT0_vect) {
  uint8_t portb = PORTB;
  for (int i = 0; i < 8; i++) {
    bool prev = bit_read(prev_portb, i);
    bool curr = bit_read(portb, i);
    if (curr != prev) {
      int pin = P_B0 | i;
      int edge = curr ? PIN_OBSERVER_EDGE_RISE : PIN_OBSERVER_EDGE_FALL;
      if (pin_observer_callbacks[i]) {
        pin_observer_callbacks[i](pin, edge);
      }
    }
  }
  prev_portb = portb;
}

static void updatePcintConfig() {
  if (observed_pin_flags > 0) {
    PCMSK0 = observed_pin_flags;
    bit_on(PCICR, PCIE0);
  } else {
    PCMSK0 = 0;
    bit_off(PCICR, PCIE0);
  }
}

void pinObserver_observePin(int pin, void (*callback)(int, int)) {
  if (!(P_B0 <= pin && pin <= P_B7)) {
    //pin must be one of B0~B7 (which belongs to PCINT)
    return;
  }
  int bit = pin & 7;
  bit_on(observed_pin_flags, bit);
  bit_spec(prev_portb, bit, digitalIo_read(pin));
  pin_observer_callbacks[bit] = callback;
  updatePcintConfig();
}

void pinObserver_unobservePin(int pin) {
  int bit = pin & 7;
  bit_off(observed_pin_flags, bit);
  pin_observer_callbacks[bit] = 0;
  updatePcintConfig();
}