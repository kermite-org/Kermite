#ifndef __KEY_CODE_TABLE_H__
#define __KEY_CODE_TABLE_H__

#include "km0/types.h"

uint16_t keyCodeMapper_mapLogicalKeyToHidKeyCode(uint8_t logicalKey, bool isSecondaryLayout);
char *keyCodeMapper_mapLogicalKeyToKeyText(uint8_t logicalKey);

#endif