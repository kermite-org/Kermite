#ifndef __NEOPIXEL_CORE_H__
#define __NEOPIXEL_CORE_H__

#include "hardware/pio.h"

void neoPixelCore_initialize(PIO pio, int sm, uint pin);
void neoPixelCore_putPixel(PIO pio, int sm, uint32_t pixel_rrggbb);

#endif