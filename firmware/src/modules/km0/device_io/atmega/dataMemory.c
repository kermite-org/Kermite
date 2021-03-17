#include "dataMemory.h"
#include "bitOperations.h"
#include <avr/eeprom.h>

uint16_t dataMemory_getCapacity() {
  return 1024;
}

uint8_t dataMemory_readByte(uint16_t addr) {
  eeprom_busy_wait();
  return eeprom_read_byte((uint8_t *)addr);
}

void dataMemory_writeByte(uint16_t addr, uint8_t val) {
  eeprom_busy_wait();
  eeprom_write_byte((uint8_t *)addr, val);
}

uint16_t dataMemory_readWord(uint16_t addr) {
  eeprom_busy_wait();
  return eeprom_read_word((uint16_t *)addr);
}

void dataMemory_writeWord(uint16_t addr, uint16_t val) {
  eeprom_busy_wait();
  eeprom_write_word((uint16_t *)addr, val);
}

void dataMemory_readBytes(uint16_t addr, uint8_t *buf, uint16_t len) {
  eeprom_busy_wait();
  eeprom_read_block((void *)buf, (void *)addr, len);
}

void dataMemory_writeBytes(uint16_t addr, uint8_t *buf, uint16_t len) {
  eeprom_busy_wait();
  eeprom_write_block((void *)buf, (void *)addr, len);
}
