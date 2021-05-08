#ifndef __KEY_CODE_TABLE_H__
#define __KEY_CODE_TABLE_H__

#include "km0/types.h"

uint16_t keyCodeTable_getLogicalKeyHidKeyCode(uint8_t logicalKey, bool isSecondaryLayout);
char *keyCodeTable_getLogicalKeyText(uint8_t logicalKey);

#endif