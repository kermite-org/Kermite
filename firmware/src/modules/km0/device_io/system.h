#ifndef __SYSTEM_H__
#define __SYSTEM_H__

#include "types.h"

#ifdef TARGET_MCU_DUMMY

#define delayMs(ms) \
  {}

#define system_readRomByte(p) \
  {}
#define system_readRomWord(p) \
  {}

#define system_enableInterrupts() \
  {}
#define system_disableInterrupts() \
  {}

#define system_initializeUserProgram() \
  {}

#endif

#ifdef TARGET_MCU_ATMEGA

#include <avr/interrupt.h>
#include <avr/pgmspace.h>
#include <util/delay.h>

#define delayMs _delay_ms

#define system_readRomByte pgm_read_byte
#define system_readRomWord pgm_read_word

#define system_enableInterrupts sei
#define system_disableInterrupts cli

#define system_initializeUserProgram() \
  { USBCON = 0; }

#endif

#endif
