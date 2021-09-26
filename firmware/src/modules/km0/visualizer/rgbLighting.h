#pragma once

#include "km0/types.h"

void rgbLighting_preConfigure();

void rgbLighting_initialize(int8_t pin);

void rgbLighting_setNumLeds(uint8_t numLeds);

void rgbLighting_update();
