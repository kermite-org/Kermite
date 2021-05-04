#ifndef __SPLIT_KEYBOARD_H__

#include "km0/types.h"

void splitKeyboard_useIndicatorLeds(int8_t pin1, int8_t pin2, bool invert);
void splitKeyboard_useIndicatorRgbLed(int8_t pin);
void splitKeyboard_useDebugUart(uint32_t baud);

void splitKeyboard_useKeyScanner(void (*keyScannerUpdateFunc)(uint8_t *keyStateBitFlags));
void splitKeyboard_setKeyIndexTable(const int8_t *scanIndexToKeyIndexMap);
void splitKeyboard_start();

#endif