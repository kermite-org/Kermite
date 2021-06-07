#include "keyScanner_basicMatrix.h"
#include "km0/base/bitOperations.h"
#include "km0/base/utils.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include "km0/kernel/keyboardMainInternal.h"

static uint8_t numRows;
static uint8_t numColumns;
static const uint8_t *rowPins;
static const uint8_t *columnPins;
static bool initialized = false;

static void keyScanner_basicMatrix_update(uint8_t *keyStateBitFlags) {
  if (!initialized) {
    return;
  }
  uint8_t keySlotIndex = 0;
  for (uint8_t i = 0; i < numRows; i++) {
    uint8_t rowPin = rowPins[i];
    digitalIo_setLow(rowPin);
    delayUs(1); //RP2040の場合僅かに待たないとキーの状態を正しく読み出せない
    for (uint8_t j = 0; j < numColumns; j++) {
      uint8_t columnPin = columnPins[j];
      bool isDown = digitalIo_read(columnPin) == 0;
      utils_writeArrayedBitFlagsBit(keyStateBitFlags, keySlotIndex, isDown);
      keySlotIndex++;
    }
    digitalIo_setHigh(rowPin);
  }
}

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
    digitalIo_setOutput(rowPin);
    digitalIo_setHigh(rowPin);
  }
  for (uint8_t i = 0; i < numColumns; i++) {
    uint8_t columnPin = columnPins[i];
    digitalIo_setInputPullup(columnPin);
  }
  initialized = true;

  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
}
