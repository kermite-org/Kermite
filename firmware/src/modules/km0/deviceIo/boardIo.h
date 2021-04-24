#ifndef __BOARD_IO_H__
#define __BOARD_IO_H__

#include "km0/types.h"

void boardIo_setupLeds(int8_t pin1, int8_t pin2, bool invert);
void boardIo_setupLedsRgb(int8_t pin);
void boardIo_writeLed1(bool value);
void boardIo_writeLed2(bool value);

#endif