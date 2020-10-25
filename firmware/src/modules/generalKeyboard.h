#ifndef __GENERAL_KEYBOARD_H__

#include <stdint.h>

void generalKeyboard_useOnboardLeds();

void generalKeyboard_useDebugUART(uint16_t baud);

void generalKeyboard_setup(
    const uint8_t *_rowPins,
    const uint8_t *_columnPins,
    const int8_t *_keySlotIndexToKeyIndexMap);

void generalKeyboard_start();

#endif