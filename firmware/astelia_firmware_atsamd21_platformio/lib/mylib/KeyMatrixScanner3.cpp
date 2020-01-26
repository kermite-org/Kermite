#include <KeyMatrixScanner3.h>
#include <Arduino.h>
#include <xpio.h>

static uint8_t numRows;
static uint8_t numColumns;
static const uint8_t *rowPins;
static const uint8_t *columnPins;
static uint16_t numKeys;
static int8_t *keyStateArray;

static bool initialized = false;

void keyMatrixScanner_initialize(
    uint8_t _numRows,
    uint8_t _numColumns,
    const uint8_t *_rowPins,
    const uint8_t *_columnPins,
    int8_t *_keyStateArray)
{

  numRows = _numRows;
  numColumns = _numColumns;
  rowPins = _rowPins;
  columnPins = _columnPins;

  for (uint8_t i = 0; i < numRows; i++)
  {
    pio_setPinModeOutput(rowPins[i]);
    pio_setPinLevelHigh(rowPins[i]);
  }
  for (uint8_t i = 0; i < numColumns; i++)
  {
    pio_setPinModeInputPullUp(columnPins[i]);
  }
  numKeys = numRows * numColumns;
  keyStateArray = _keyStateArray;

  for (int i = 0; i < numKeys; i++)
  {
    keyStateArray[i] = KEY_STATE_UP;
  }

  initialized = true;
}

void keyMatrixScanner_update()
{
  if (!initialized)
  {
    return;
  }

  for (uint8_t i = 0; i < numRows; i++)
  {
    pio_setPinLevelLow(rowPins[i]);
    for (uint8_t j = 0; j < numColumns; j++)
    {
      int keyIndex = i * numColumns + j;
      bool isDown = pio_getPinLevel(columnPins[j]) == 0;
      int8_t prevState = keyStateArray[keyIndex];
      int8_t nextState = KEY_STATE__NOCHANGE;
      if (prevState < 0 && isDown)
      {
        nextState = KEY_STATE_DOWN_TRIGGER;
      }
      else if (prevState > 0 && !isDown)
      {
        nextState = KEY_STATE_UP_TRIGGER;
      }
      else if (prevState == KEY_STATE_DOWN_TRIGGER && isDown)
      {
        nextState = KEY_STATE_DOWN;
      }
      else if (prevState == KEY_STATE_UP_TRIGGER && !isDown)
      {
        nextState = KEY_STATE_UP;
      }

      if (nextState != KEY_STATE__NOCHANGE)
      {
        keyStateArray[keyIndex] = nextState;
      }
    }
    pio_setPinLevelHigh(rowPins[i]);
  }
}
