#ifndef __ROM_DATA_H__
#define __ROM_DATA_H__

#include "km0/types.h"

#if defined KERMITE_TARGET_MCU_ATMEGA
#include <avr/pgmspace.h>
#define ROM_DATA PROGMEM

#define romData_readByte(ptr) (pgm_read_byte(ptr))
#define romData_readWord(ptr) (pgm_read_word(ptr))
#define romData_readDoubleWord(ptr) (pgm_read_dword(ptr))

#elif defined KERMITE_TARGET_MCU_RP2040
#define ROM_DATA

#define romData_readByte(ptr) (*(ptr))
#define romData_readWord(ptr) (*(ptr))
#define romData_readDoubleWord(ptr) (*(ptr))

#else
#error KERMITE_TARGET_MCU_* is not defined
#endif

#endif