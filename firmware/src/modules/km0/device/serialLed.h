#pragma once

#include "km0/types.h"

void serialLed_initialize(int8_t pin);
void serialLed_putPixel(uint32_t pixel_rrggbb);
void serialLed_putPixelWithAlpha(uint32_t pixel_rrggbb, uint8_t alpha);
