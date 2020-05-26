#ifndef __XF_EEPROM_H__
#define __XF_EEPROM_H__

#include "types.h"

uint8_t xf_eeprom_read_byte(uint16_t addr);
void xf_eeprom_write_byte(uint16_t addr, uint8_t val);

uint16_t xf_eeprom_read_word(uint16_t addr);
void xf_eeprom_write_word(uint16_t addr, uint16_t val);

void xf_eeprom_read_block(uint16_t addr, uint8_t *buf, uint16_t len);
void xf_eeprom_write_block(uint16_t addr, uint8_t *buf, uint16_t len);

#endif
