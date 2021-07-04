#pragma once

#include "km0/types.h"

void keyScanner_directWired_initialize(uint8_t numPins, const uint8_t *pins, uint8_t scanIndexBase);

void keyScanner_directWired_update(uint8_t *keyStateBitFlags);
