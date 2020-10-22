#include "keyMatrixScanner8x8.h"
#include "bit_operations.h"
#include "pio.h"
#include <avr/io.h>
//#include <stdio.h>

#define NumMaxRows 8
#define NumMaxColums 8

uint8_t numRows;
uint8_t numColumns;
const uint8_t *rowPins;
const uint8_t *columnPins;
void (*keyStateListenerCallback)(uint8_t keySlotIndex, bool isDown);
bool initialized = false;

uint8_t rowScanValues[NumMaxRows];
uint8_t keyStateFlags[NumMaxRows];

//---------------------------------------------

void keyMatrixScanner_initialize(
    uint8_t _numRows,
    uint8_t _numColumns,
    const uint8_t *_rowPins,
    const uint8_t *_columnPins,
    void (*_keyStateListenerCallback)(uint8_t keySlotIndex, bool isDown)) {

  numRows = _numRows;
  numColumns = _numColumns;
  rowPins = _rowPins;
  columnPins = _columnPins;
  keyStateListenerCallback = _keyStateListenerCallback;

  for (uint8_t i = 0; i < NumMaxRows; i++) {
    rowScanValues[i] = 0;
    keyStateFlags[i] = 0;
  }

  for (uint8_t i = 0; i < numRows; i++) {
    // printf("row pin %d %d\n", i, rowPins[i]);
    pio_setOutput(rowPins[i]);
    pio_setHigh(rowPins[i]);
  }
  for (uint8_t i = 0; i < numColumns; i++) {
    // printf("column pin %d %d\n", i, columnPins[i]);
    pio_setInputPullup(columnPins[i]);
  }
  initialized = true;
}

void keyMatrixScanner_update() {
  if (!initialized) {
    return;
  }

  for (uint8_t i = 0; i < numRows; i++) {
    pio_setLow(rowPins[i]);
    uint8_t rowValue = 0;
    for (uint8_t j = 0; j < numColumns; j++) {
      bit_spec(rowValue, j, pio_input(columnPins[j]) == 0);
    }
    rowScanValues[i] = rowValue;
    pio_setHigh(rowPins[i]);
  }

#if 0
  for (uint8_t i = 0; i < numRows; i++) {
    for (int8_t j = 7; j >= 0; j--) {
      printf("%d", bit_read(rowScanValues[i], j));
    }
    printf(" ");
  }
  printf("\n");
#endif

  for (uint8_t i = 0; i < numRows; i++) {
    for (uint8_t j = 0; j < numColumns; j++) {
      uint8_t k = i * numColumns + j;
      bool curr = bit_read(keyStateFlags[i], j);
      bool next = bit_is_on(rowScanValues[i], j);
      if (!curr && next) {
        //printf("keydown %d\n", k);
        keyStateListenerCallback(k, true);
      }
      if (curr && !next) {
        //printf("keyup %d\n", k);
        keyStateListenerCallback(k, false);
      }
      bit_spec(keyStateFlags[i], j, next);
    }
  }
}

uint8_t *keyMatrixScanner_getKeyStateFlags() {
  return keyStateFlags;
}
