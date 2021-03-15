#ifndef __EEPROM_H__
#define __EEPROM_H__

#include "types.h"

uint16_t dataMemory_getCapacity();

uint8_t dataMemory_readByte(uint16_t addr);
void dataMemory_writeByte(uint16_t addr, uint8_t val);

uint16_t dataMemory_readWord(uint16_t addr);
void dataMemory_writeWord(uint16_t addr, uint16_t val);

void dataMemory_readBlock(uint16_t addr, uint8_t *buf, uint16_t len);
void dataMemory_writeBlock(uint16_t addr, uint8_t *buf, uint16_t len);

#endif
