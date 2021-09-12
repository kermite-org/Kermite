#include "boardIo.h"

static BoardIoLedFunction ledFunc = 0;

void boardIo_internal_setLedFunction(BoardIoLedFunction _ledFunc) {
  ledFunc = _ledFunc;
}

void boardIo_writeLed1(bool value) {
  if (ledFunc) {
    ledFunc(0, value ? LedOp_TurnOn : LedOp_TurnOff);
  }
}

void boardIo_writeLed2(bool value) {
  if (ledFunc) {
    ledFunc(1, value ? LedOp_TurnOn : LedOp_TurnOff);
  }
}

void boardIo_toggleLed1() {
  if (ledFunc) {
    ledFunc(0, LedOp_Toggle);
  }
}

void boardIo_toggleLed2() {
  if (ledFunc) {
    ledFunc(1, LedOp_Toggle);
  }
}