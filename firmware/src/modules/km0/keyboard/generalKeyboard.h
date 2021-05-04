#ifndef __GENERAL_KEYBOARD_H__

#include "km0/types.h"

void generalKeyboard_useIndicatorLeds(int8_t pin1, uint8_t pin2, bool invert);
void generalKeyboard_useIndicatorRgbLed(int8_t pin);
void generalKeyboard_useDebugUart(uint32_t baud);

void generalKeyboard_useKeyScanner(void (*keyScannerUpdateFunc)(uint8_t *keyStateBitFlags));
void generalKeyboard_useKeyScannerExtra(void (*keyScannerUpdateFunc)(uint8_t *keyStateBitFlags));
void generalKeyboard_setKeyIndexTable(const int8_t *scanIndexToKeyIndexMap);
void generalKeyboard_start();

#endif