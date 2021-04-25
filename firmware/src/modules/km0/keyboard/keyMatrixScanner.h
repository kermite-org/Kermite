#ifndef __KEY_MATRIX_SCANNER_2_H__
#define __KEY_MATRIX_SCANNER_2_H__

#include "km0/types.h"

//numRows: 行の数(1 <= numRows <= 8)
//numColumns: 列の数(1 <= numColums <= 8)
//rowPins: 行に割り当てるピン, 要素数がnumRowsの配列
//columnPins: 列に割り当てるピン, 要素数がnumColumnsの配列
//keyStateBitFlags: キー状態がビットフラグとして詰めて格納されるバイト配列, (numRows * numColumns / 8)要素必要
void keyMatrixScanner_initialize(
    uint8_t numRows,
    uint8_t numColumns,
    const uint8_t *rowPins,
    const uint8_t *columnPins);

void keyMatrixScanner_update(uint8_t *keyStateBitFlags);

#endif
