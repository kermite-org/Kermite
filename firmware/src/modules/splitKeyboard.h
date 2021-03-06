#ifndef __SPLIT_KEYBOARD_H__

#include <stdint.h>

#define OptionSlot_EmitKeyStroke 0
#define OptionSlot_EmitRealtimeEvents 1
#define OptionSlot_AffectKeyHoldStateToLED 2
#define OptionSlot_UseHeartBeatLED 3

void splitKeyboard_useOnboardLeds();
void splitKeyboard_useDebugUART(uint16_t baud);
void splitKeyboard_useOptionFixed(uint8_t slot, uint8_t value);
void splitKeyboard_useOptionDynamic(uint8_t slot);

void splitKeyboard_setup(
    const uint8_t *_rowPins,
    const uint8_t *_columnPins,
    const int8_t *_keySlotIndexToKeyIndexMap);

void splitKeyboard_start();

#endif