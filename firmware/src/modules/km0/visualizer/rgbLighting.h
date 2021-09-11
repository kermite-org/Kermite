#pragma once

#include "km0/types.h"

void rgbLighting_preConfigure();

void rgbLighting_initialize(int8_t pin, uint8_t numLeds, uint8_t numLedsRight);

void rgbLighting_setBoardSide(int8_t side);

void rgbLighting_update();
