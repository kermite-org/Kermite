#ifndef __GENERAL_SPLIT_KEYBOARD_H__

#include <stdint.h>

void splitKeyboard_useOnboardLeds();

void splitKeyboard_useDebugUART(uint16_t baud);

void splitKeyboard_setup(
    const uint8_t *_rowPins,
    const uint8_t *_columnPins,
    const int8_t *_keySlotIndexToKeyIndexMap);

void splitKeyboard_start();

#endif