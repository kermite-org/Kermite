#ifndef __GENERAL_KEYBOARD_H__

#include <stdint.h>

#define OptionSlot_EmitKeyStroke 0
#define OptionSlot_EmitRealtimeEvents 1
#define OptionSlot_AffectKeyHoldStateToLED 2
#define OptionSlot_UseHeartBeatLED 3

void generalKeyboard_useOnboardLeds();
void generalKeyboard_useDebugUART(uint16_t baud);
void generalKeyboard_useOptionFixed(uint8_t slot, uint8_t value);
void generalKeyboard_useOptionDynamic(uint8_t slot);

void generalKeyboard_setup(
    const uint8_t *_rowPins,
    const uint8_t *_columnPins,
    const int8_t *_keySlotIndexToKeyIndexMap);

void generalKeyboard_start();

#endif