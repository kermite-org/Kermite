#include "km0/device/serialLed.h"
#include "config.h"
#include "neoPixelCore.h"
#include <avr/interrupt.h>

void serialLed_initialize() {
  neoPixelCore_initialize();
}

void serialLed_putPixel(uint32_t pixel_rrggbb) {
  uint8_t r = pixel_rrggbb >> 16 & 0xFF;
  uint8_t g = pixel_rrggbb >> 8 & 0xFF;
  uint8_t b = pixel_rrggbb & 0xFF;
  // cli();
  neoPixelCore_emitByte(g);
  neoPixelCore_emitByte(r);
  neoPixelCore_emitByte(b);
  // sei();
}

void serialLed_putPixelWithAlpha(uint32_t pixel_rrggbb, uint8_t alpha) {
  uint8_t aa = alpha;
  uint8_t rr = ((pixel_rrggbb >> 16 & 0xFF) * aa) >> 8;
  uint8_t gg = ((pixel_rrggbb >> 8 & 0xFF) * aa) >> 8;
  uint8_t bb = ((pixel_rrggbb & 0xFF) * aa) >> 8;
  uint32_t pixel_rrggbb_mod = (uint32_t)rr << 16 | (uint32_t)gg << 8 | (uint32_t)bb;
  serialLed_putPixel(pixel_rrggbb_mod);
}
