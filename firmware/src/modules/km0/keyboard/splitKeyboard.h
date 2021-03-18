#ifndef __SPLIT_KEYBOARD_H__

#include "types.h"

#define OptionSlot_EmitKeyStroke 0
#define OptionSlot_EmitRealtimeEvents 1
#define OptionSlot_AffectKeyHoldStateToLED 2
#define OptionSlot_UseHeartBeatLED 3
#define OptionSlot_MasterSide 4

void splitKeyboard_useOnboardLED(int8_t pin, bool invert);
void splitKeyboard_useDebugUART(uint16_t baud);
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