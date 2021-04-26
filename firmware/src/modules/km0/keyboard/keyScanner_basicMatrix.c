#include "keyScanner_basicMatrix.h"
#include "km0/common/bitOperations.h"
#include "km0/deviceIo/dio.h"
#include "km0/deviceIo/system.h"

static uint8_t numRows;
static uint8_t numColumns;
static const uint8_t *rowPins;
static const uint8_t *columnPins;
static bool initialized = false;

void keyScanner_basicMatrix_initialize(
    uint8_t _numRows,
    uint8_t _numColumns,
    const uint8_t *_rowPins,
    const uint8_t *_columnPins) {
  numRows = _numRows;
  numColumns = _numColumns;
  rowPins = _rowPins;
  columnPins = _columnPins;

  for (uint8_t i = 0; i < numRows; i++) {
    uint8_t rowPin = rowPins[i];
    dio_setOutput(rowPin);
    dio_setHigh(rowPin);
  }
  for (uint8_t i = 0; i < numColumns; i++) {
    uint8_t columnPin = columnPins[i];
    dio_setInputPullup(columnPin);
  }
  initialized = true;
}

void keyScanner_basicMatrix_update(uint8_t *keyStateBitFlags) {
  if (!initialized) {
    return;
  }
  uint8_t keySlotIndex = 0;
  for (uint8_t i = 0; i < numRows; i++) {
    uint8_t rowPin = rowPins[i];
    dio_setLow(rowPin);
    delayUs(1); //RP2040の場合僅かに待たないとキーの状態を正しく読み出せない
    for (uint8_t j = 0; j < numColumns; j++) {
      uint8_t byteIndex = keySlotIndex >> 3;
      uint8_t bitIndex = keySlotIndex & 7;
      uint8_t columnPin = columnPins[j];
      bool isDown = dio_read(columnPin) == 0;
      bit_spec(keyStateBitFlags[byteIndex], bitIndex, isDown);
      keySlotIndex++;
    }
    dio_setHigh(rowPin);
  }
}
