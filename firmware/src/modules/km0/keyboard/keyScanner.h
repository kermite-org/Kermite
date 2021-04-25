#ifndef __KEY_SCANNER_H__
#define __KEY_SCANNER_H__

#include "km0/types.h"

void keyScanner_initializeBasicMatrix(
    uint8_t numRows,
    uint8_t numColumns,
    const uint8_t *rowPins,
    const uint8_t *columnPins) __attribute__((weak));

void keyScanner_initializeDirectWired(uint8_t numPins, const uint8_t *pins) __attribute__((weak));

void keyScanner_update(uint8_t *keyStateBitFlags);

#endif