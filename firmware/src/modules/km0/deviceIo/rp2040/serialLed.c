#include "km0/deviceIo/serialLed.h"
#include "config.h"
#include "neoPixelCore.h"

#ifndef SERIALLED_RP2040_PIO
#define SRRIALLED_RP2040_PIO pio0
#endif

#ifndef SERIALLED_RP2040_SM
#define SERIALLED_RP2040_SM 1
#endif

static const PIO serial_led_pio = SRRIALLED_RP2040_PIO;
static const int serial_led_sm = SERIALLED_RP2040_SM;

void serialLed_initialize(uint8_t pin) {
  neoPixelCore_initialize(serial_led_pio, serial_led_sm, pin);
}
void serialLed_putPixel(uint32_t pixel_aarrggbb) {
  neoPixelCore_putPixel(serial_led_pio, serial_led_sm, pixel_aarrggbb);
}