#ifndef __KEY_MATRIX_SCANNER_8X8_H__
#define __KEY_MATRIX_SCANNER_8X8_H__

#include "types.h"

//numRows: 行の数(1 <= numRows <= 8)
//numColumns: 列の数(1 <= numColums <= 8)
//rowPins: 行に割り当てるピン, 要素数がnumRowsの配列
//columnPins: 列に割り当てるピン, 要素数がnumColumnsの配列
//keyStateListenerCallback: キーが押したり離されたときに呼ばれるコールバック
void keyMatrixScanner_initialize(
    uint8_t numRows,
    uint8_t numColumns,
    const uint8_t *rowPins,
    const uint8_t *columnPins,
    void (*keyStateListenerCallback)(uint8_t keySlotIndex, bool isDown));

void keyMatrixScanner_update();

uint8_t *keyMatrixScanner_getKeyStateFlags();

#endif
