#ifndef __KEYBOARD_CORE_LOGIC_H__
#define __KEYBOARD_CORE_LOGIC_H__

#include "km0/types.h"

void keyboardCoreLogic_initialize();
void keyboardCoreLogic_setSystemLayout(uint8_t layout);
void keyboardCoreLogic_setWiringMode(uint8_t mode);
uint16_t keyboardCoreLogic_getLayerActiveFlags();
uint8_t *keyboardCoreLogic_getOutputHidReportBytes();
void keyboardCoreLogic_issuePhysicalKeyStateChanged(uint8_t keyIndex, bool isDown);
void keyboardCoreLogic_processTicker(uint8_t ms);
void keyboardCoreLogic_halt();

#endif