#pragma once

#include "km0/types.h"

void splitKeyboard_setNumScanSlots(uint8_t numScanSlotsLeft, uint8_t numScanSlotsRight);
void splitKeyboard_setBoardConfigCallback(void (*callback)(int8_t side, bool isMaster));
void splitKeyboard_start();
