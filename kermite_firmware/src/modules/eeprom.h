#ifndef __XF_EEPROM_H__
#define __XF_EEPROM_H__

#include "types.h"

uint8_t eeprom_readByte(uint16_t addr);
void eeprom_writeByte(uint16_t addr, uint8_t val);

uint16_t eeprom_readWord(uint16_t addr);
void eeprom_writeWord(uint16_t addr, uint16_t val);

void eeprom_readBlock(uint16_t addr, uint8_t *buf, uint16_t len);
void eeprom_writeBlock(uint16_t addr, uint8_t *buf, uint16_t len);

#endif
