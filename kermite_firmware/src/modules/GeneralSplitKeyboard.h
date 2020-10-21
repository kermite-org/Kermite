#ifndef __GENERAL_SPLIT_KEYBOARD_H__

#include <stdint.h>

void generalSplitKeyboard_useOnboardLeds();

void generalSplitKeyboard_setup(
    const uint8_t *_rowPins,
    const uint8_t *_columnPins,
    const int8_t *_keySlotIndexToKeyIndexMap);

void generalSplitKeyboard_start();

#endif