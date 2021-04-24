#include "km0/deviceIo/serialLed.h"
#include "config.h"
#include "neoPixelCore.h"

#ifndef KM0_RP_SERIAL_LED__PIO_INSTANCE
#define KM0_RP_SERIAL_LED__PIO_INSTANCE pio0
#endif

#ifndef KM0_RP_SERIAL_LED__PIO_SM
#define KM0_RP_SERIAL_LED__PIO_SM 1
#endif

static const PIO serial_led_pio = KM0_RP_SERIAL_LED__PIO_INSTANCE;
static const int serial_led_sm = KM0_RP_SERIAL_LED__PIO_SM;

void serialLed_initialize(uint8_t pin) {
  neoPixelCore_initialize(serial_led_pio, serial_led_sm, pin);
}
void serialLed_putPixel(uint32_t pixel_aarrggbb) {
  neoPixelCore_putPixel(serial_led_pio, serial_led_sm, pixel_aarrggbb);
}