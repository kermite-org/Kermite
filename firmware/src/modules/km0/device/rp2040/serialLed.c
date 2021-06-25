#include "km0/device/serialLed.h"
#include "km0/base/configImport.h"
#include "km0/device/digitalIo.h"
#include "neoPixelCore.h"

#ifndef KM0_RP_SERIAL_LED__PIN_LED
#error KM0_RP_SERIAL_LED__PIN_LED is not defined;
#endif

#ifndef KM0_RP_SERIAL_LED__PIO_INSTANCE
#define KM0_RP_SERIAL_LED__PIO_INSTANCE pio0
#endif

#ifndef KM0_RP_SERIAL_LED__PIO_SM
#define KM0_RP_SERIAL_LED__PIO_SM 1
#endif

static const int pin = KM0_RP_SERIAL_LED__PIN_LED;
static const PIO serial_led_pio = KM0_RP_SERIAL_LED__PIO_INSTANCE;
static const int serial_led_sm = KM0_RP_SERIAL_LED__PIO_SM;

void serialLed_initialize() {
  neoPixelCore_initialize(serial_led_pio, serial_led_sm, pin);
}

void serialLed_putPixel(uint32_t pixel_rrggbb) {
  neoPixelCore_putPixel(serial_led_pio, serial_led_sm, pixel_rrggbb);
}

void serialLed_putPixelWithAlpha(uint32_t pixel_rrggbb, uint8_t alpha) {
  uint8_t aa = alpha;
  uint8_t rr = ((pixel_rrggbb >> 16 & 0xFF) * aa) >> 8;
  uint8_t gg = ((pixel_rrggbb >> 8 & 0xFF) * aa) >> 8;
  uint8_t bb = ((pixel_rrggbb & 0xFF) * aa) >> 8;
  uint32_t pixel_rrggbb_mod = (uint32_t)rr << 16 | (uint32_t)gg << 8 | (uint32_t)bb;
  neoPixelCore_putPixel(serial_led_pio, serial_led_sm, pixel_rrggbb_mod);
}
