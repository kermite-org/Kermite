#ifndef __SPLIT_KEYBOARD_H__

#include "km0/types.h"

enum {
  OptionSlot_EmitKeyStroke = 0,
  OptionSlot_EmitRealtimeEvents = 1,
  OptionSlot_AffectKeyHoldStateToLED = 2,
  OptionSlot_UseHeartBeatLED = 3,
  OptionSlot_MasterSide = 4
};

void splitKeyboard_useIndicatorLeds(int8_t pin1, int8_t pin2, bool invert);
void splitKeyboard_useIndicatorRgbLed(int8_t pin);
void splitKeyboard_useDebugUart(uint32_t baud);
void splitKeyboard_useOptionFixed(uint8_t slot, uint8_t value);
void splitKeyboard_useOptionDynamic(uint8_t slot);

void splitKeyboard_setup(
    uint8_t numRows,
    uint8_t numColumns,
    const uint8_t *rowPins,
    const uint8_t *columnPins,
    const int8_t *keySlotIndexToKeyIndexMap);

void splitKeyboard_start();

#endif