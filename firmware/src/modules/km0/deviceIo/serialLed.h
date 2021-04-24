#ifndef __SERIAL_LED__
#define __SERIAL_LED__

#include "km0/types.h"

void serialLed_initialize(uint8_t pin);
void serialLed_putPixel(uint32_t pixel_aarrggbb);

#endif