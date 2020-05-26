#include "xf_eeprom.h"
#include "bit_operations.h"
#include <avr/eeprom.h>

uint8_t xf_eeprom_read_byte(uint16_t addr) {
  eeprom_busy_wait();
  return eeprom_read_byte((uint8_t *)addr);
}

void xf_eeprom_write_byte(uint16_t addr, uint8_t val) {
  eeprom_busy_wait();
  eeprom_write_byte((uint8_t *)addr, val);
}

uint16_t xf_eeprom_read_word(uint16_t addr) {
  eeprom_busy_wait();
  return eeprom_read_word((uint16_t *)addr);
}

void xf_eeprom_write_word(uint16_t addr, uint16_t val) {
  eeprom_busy_wait();
  eeprom_write_word((uint16_t *)addr, val);
}

void xf_eeprom_read_block(uint16_t addr, uint8_t *buf, uint16_t len) {
  eeprom_busy_wait();
  eeprom_read_block((void *)buf, (void *)addr, len);
}

void xf_eeprom_write_block(uint16_t addr, uint8_t *buf, uint16_t len) {
  eeprom_busy_wait();
  eeprom_write_block((void *)buf, (void *)addr, len);
}
