#pragma once

#include "km0/types.h"

void keyboardMain_useKeyScanner(void (*_keyScannerUpdateFunc)(uint8_t *keyStateBitFlags));
void keyboardMain_usePointingDevice(void (*_pointingDeviceUpdateFunc)(int8_t *outDeltaX, int8_t *outDeltaY));
void keyboardMain_setKeyIndexTable(const int8_t *_scanIndexToKeyIndexMap);
void keyboardMain_useRgbLightingModule(void (*_updateFn)(void));
void keyboardMain_useOledDisplayModule(void (*_updateFn)(void));
void keyboardMain_useHostKeyboardStatusOutputModule(void (*_updateFn)(void));