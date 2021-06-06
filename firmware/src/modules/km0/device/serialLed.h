#ifndef __SERIAL_LED__
#define __SERIAL_LED__

#include "km0/types.h"

void serialLed_initialize();
void serialLed_putPixel(uint32_t pixel_rrggbb);
void serialLed_putPixelWithAlpha(uint32_t pixel_rrggbb, uint8_t alpha);

#endif