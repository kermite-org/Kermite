#ifndef __GENERAL_KEYBOARD_H__

#include "types.h"

#define OptionSlot_EmitKeyStroke 0
#define OptionSlot_EmitRealtimeEvents 1
#define OptionSlot_AffectKeyHoldStateToLED 2
#define OptionSlot_UseHeartBeatLED 3

void generalKeyboard_useIndicatorLEDs(int8_t pin1, uint8_t pin2, bool invert);
void generalKeyboard_useDebugUART(uint16_t baud);
void generalKeyboard_useOptionFixed(uint8_t slot, uint8_t value);
void generalKeyboard_useOptionDynamic(uint8_t slot);

void generalKeyboard_setup(
    uint8_t numRows,
    uint8_t numColumns,
    const uint8_t *rowPins,
    const uint8_t *columnPins,
    const int8_t *keySlotIndexToKeyIndexMap);

void generalKeyboard_start();

#endif