#ifndef __KEY_ACTION_REMAPPER_H__
#define __KEY_ACTION_REMAPPER_H__

#include "km0/types.h"

void keyActionRemapper_setupDataReader();
uint16_t keyActionRemapper_translateKeyOperation(uint16_t opWord, uint8_t wiringMode);

#endif