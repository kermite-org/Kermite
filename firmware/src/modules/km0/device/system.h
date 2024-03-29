#pragma once

#include "km0/types.h"

void delayMs(uint16_t ms);
void delayUs(uint16_t us);

void system_enableInterrupts();
void system_disableInterrupts();
void system_initializeUserProgram();
void system_jumpToDfuBootloader();
void system_setupFallbackStdout();
uint32_t system_getSystemTimeMs();
