#pragma once

#include "km0/types.h"

void keyScanner_basicMatrix_initialize(
    uint8_t numRows,
    uint8_t numColumns,
    const uint8_t *rowPins,
    const uint8_t *columnPins, uint8_t _scanIndexBase);

void keyScanner_basicMatrix_update(uint8_t *keyStateBitFlags);
