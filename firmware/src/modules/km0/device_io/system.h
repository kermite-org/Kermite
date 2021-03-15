#ifndef __SYSTEM_H__
#define __SYSTEM_H__

#include "types.h"

#ifdef TARGET_MCU_ATMEGA

#include <avr/pgmspace.h>
#include <util/delay.h>
#define delayMs _delay_ms

#define system_readRomByte pgm_read_byte
#define system_readRomWord pgm_read_word

#endif

#endif
