#ifndef __BOARD_LED_H__
#define __BOARD_LED_H__

#include "types.h"

void boardLED_initLEDs(int8_t pin1, int8_t pin2, bool invert);
void boardLED_initRgbLED(int8_t pin);
void boardLED_outputLED1(bool value);
void boardLED_outputLED2(bool value);

#endif