#pragma once

#include "km0/types.h"

uint16_t keyCodeTranslator_mapLogicalKeyToHidKeyCode(uint8_t logicalKey, bool isSecondaryLayout);
char *keyCodeTranslator_mapLogicalKeyToKeyText(uint8_t logicalKey);
