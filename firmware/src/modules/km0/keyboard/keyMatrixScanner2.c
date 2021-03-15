#include "keyMatrixScanner2.h"
#include "bitOperations.h"
#include "dio.h"

static uint8_t numRows;
static uint8_t numColumns;
static const uint8_t *rowPins;
static const uint8_t *columnPins;
static uint8_t *keyStateBitFlags;
static bool initialized = false;

void keyMatrixScanner_initialize(
    uint8_t _numRows,
    uint8_t _numColumns,
    const uint8_t *_rowPins,
    const uint8_t *_columnPins,
    uint8_t *_keyStateBitFlags) {

  numRows = _numRows;
  numColumns = _numColumns;
  rowPins = _rowPins;
  columnPins = _columnPins;

  for (uint8_t i = 0; i < numRows; i++) {
    dio_setOutput(rowPins[i]);
    dio_setHigh(rowPins[i]);
  }
  for (uint8_t i = 0; i < numColumns; i++) {
    dio_setInputPullup(columnPins[i]);
  }

  keyStateBitFlags = _keyStateBitFlags;
  initialized = true;
}

void keyMatrixScanner_update() {
  if (!initialized) {
    return;
  }

  uint8_t keySlotIndex = 0;
  for (uint8_t i = 0; i < numRows; i++) {
    dio_setLow(rowPins[i]);
    for (uint8_t j = 0; j < numColumns; j++) {
      uint8_t byteIndex = keySlotIndex >> 3;
      uint8_t bitIndex = keySlotIndex & 7;
      bool isDown = dio_read(columnPins[j]) == 0;
      bit_spec(keyStateBitFlags[byteIndex], bitIndex, isDown);
      keySlotIndex++;
    }
    dio_setHigh(rowPins[i]);
  }
}
