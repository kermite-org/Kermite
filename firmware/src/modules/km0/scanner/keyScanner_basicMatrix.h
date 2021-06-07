#ifndef __KEY_SCANNER_BASIC_MATRIX_H__
#define __KEY_SCANNER_BASIC_MATRIX_H__

#include "km0/types.h"

void keyScanner_basicMatrix_initialize(
    uint8_t numRows,
    uint8_t numColumns,
    const uint8_t *rowPins,
    const uint8_t *columnPins);

#endif