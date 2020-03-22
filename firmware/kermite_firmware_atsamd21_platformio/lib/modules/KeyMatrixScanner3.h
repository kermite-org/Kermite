#ifndef __KEY_MATRIX_SCANNER_3_H__
#define __KEY_MATRIX_SCANNER_3_H__

#include <stdint.h>

#define KEY_STATE_UP -2
#define KEY_STATE_UP_TRIGGER -1
#define KEY_STATE__NOCHANGE 0
#define KEY_STATE_DOWN_TRIGGER 1
#define KEY_STATE_DOWN 2

void keyMatrixScanner_initialize(
    uint8_t numRows,
    uint8_t numColumns,
    const uint8_t *rowPins,
    const uint8_t *columnPins,
    int8_t *keyStateArray);

void keyMatrixScanner_update();

#endif
