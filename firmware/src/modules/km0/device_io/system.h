#ifndef __SYSTEM_H__
#define __SYSTEM_H__

#include "types.h"

void delayMs(uint16_t ms);

uint8_t system_readRomByte(uint8_t *ptr);
uint16_t system_readRomWord(uint16_t *ptr);
void system_enableInterrupts();
void system_disableInterrupts();
void system_initializeUserProgram();

#endif
