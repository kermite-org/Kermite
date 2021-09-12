#pragma once
#include "km0/types.h"

enum {
  LedOp_TurnOn = 1,
  LedOp_TurnOff = 2,
  LedOp_Toggle = 3
};

typedef void (*BoardIoLedFunction)(int index, int op);

void boardIo_internal_setLedFunction(BoardIoLedFunction ledFunc);
void boardIo_writeLed1(bool value);
void boardIo_writeLed2(bool value);
void boardIo_toggleLed1();
void boardIo_toggleLed2();
