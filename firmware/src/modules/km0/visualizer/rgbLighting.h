#ifndef __RGB_LIGHTING_H__
#define __RGB_LIGHTING_H__

#include "km0/types.h"

void rgbLighting_initialize(uint8_t pin, uint8_t numLeds);

void rgbLighting_update();

#endif