#ifndef __SERIAL_LED__
#define __SERIAL_LED__

#include "types.h"

void serialLED_initialize(uint8_t pin);
void serialLED_putPixel(uint32_t pixel_aarrggbb);

#endif