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

inline uint8_t romData_readByte(const uint8_t *ptr) { return *ptr; }
inline uint16_t romData_readWord(const uint16_t *ptr) { return *ptr; }
inline uint32_t romData_readDoubleWord(const uint32_t *ptr) { return *ptr; }

#else
#error KERMITE_TARGET_MCU_* is not defined
#endif

#endif