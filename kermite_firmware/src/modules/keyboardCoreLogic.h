#ifndef __KEYBOARD_CORE_LOGIC_H__
#define __KEYBOARD_CORE_LOGIC_H__

#include "types.h"

void keyboardCoreLogic_initialize();
uint16_t keyboardCoreLogic_getLayerActiveFlags();
uint8_t *keyboardCoreLogic_getOutputHidReportBytes();
void keyboardCoreLogic_issuePhysicalKeyStateChanged(uint8_t keyIndex, bool isDown);
void keyboardCoreLogic_processTicker(uint8_t ms);
void keyboardCoreLogic_halt();

#endif