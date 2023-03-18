#include "keyScanner_basicMatrix.h"
#include "km0/base/bitOperations.h"
#include "km0/base/utils.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"

static uint8_t numRows = 0;
static uint8_t numColumns = 0;
static const uint8_t *rowPins;
static const uint8_t *columnPins;
static uint8_t scanIndexBase;

void keyScanner_basicMatrix_initialize(
    uint8_t _numRows,
    uint8_t _numColumns,
    const uint8_t *_rowPins,
    const uint8_t *_columnPins, uint8_t _scanIndexBase) {
  numRows = _numRows;
  numColumns = _numColumns;
  rowPins = _rowPins;
  columnPins = _columnPins;
  scanIndexBase = _scanIndexBase;

  for (uint8_t i = 0; i < numRows; i++) {
    digitalIo_setInputPullup(rowPins[i]);
  }
  for (uint8_t i = 0; i < numColumns; i++) {
    digitalIo_setInputPullup(columnPins[i]);
  }
}

void keyScanner_basicMatrix_update(uint8_t *keyStateBitFlags) {
  uint8_t keySlotIndex = 0;
  for (uint8_t i = 0; i < numRows; i++) {
    uint8_t rowPin = rowPins[i];
    digitalIo_setOutput(rowPin);
    digitalIo_setLow(rowPin);
    delayUs(5); //RP2040の場合僅かに待たないとキーの状態を正しく読み出せない
    for (uint8_t j = 0; j < numColumns; j++) {
      uint8_t columnPin = columnPins[j];
      bool isDown = digitalIo_read(columnPin) == 0;
      utils_writeArrayedBitFlagsBit(keyStateBitFlags, scanIndexBase + keySlotIndex, isDown);
      keySlotIndex++;
    }
    digitalIo_setInputPullup(rowPin);
  }
}
