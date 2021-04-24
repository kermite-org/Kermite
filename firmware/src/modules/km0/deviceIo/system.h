#ifndef __SYSTEM_H__
#define __SYSTEM_H__

#include "types.h"

void delayMs(uint16_t ms);
void delayUs(uint16_t us);

uint8_t system_readRomByte(const uint8_t *ptr);
uint16_t system_readRomWord(const uint16_t *ptr);
void system_enableInterrupts();
void system_disableInterrupts();
void system_initializeUserProgram();

#endif
