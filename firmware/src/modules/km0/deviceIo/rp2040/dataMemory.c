#include "km0/deviceIo/dataMemory.h"
#include "hardware/flash.h"
#include "hardware/sync.h"
#include "pico/stdlib.h"
#include <string.h>

#define FLASH_TARGET_OFFSET (256 * 1024)

static uint8_t ramData[FLASH_SECTOR_SIZE] = { 0 };

static const uint8_t *ptrFlashRomData = (const uint8_t *)(XIP_BASE + FLASH_TARGET_OFFSET);

uint16_t dataMemory_getCapacity() {
  return FLASH_SECTOR_SIZE;
}

uint8_t dataMemory_readByte(uint16_t addr) {
  return ptrFlashRomData[addr];
}

uint16_t dataMemory_readWord(uint16_t addr) {
  uint8_t lo = ptrFlashRomData[addr];
  uint8_t hi = ptrFlashRomData[addr + 1];
  return (hi << 8) | lo;
}

void dataMemory_readBytes(uint16_t addr, uint8_t *buf, uint16_t len) {
  memcpy(buf, ptrFlashRomData + addr, len);
}

static void loadRamDataFromFlash() {
  memcpy(ramData, ptrFlashRomData, FLASH_SECTOR_SIZE);
}

static void storeRamDataToFlash() {
  uint32_t status = save_and_disable_interrupts();
  flash_range_erase(FLASH_TARGET_OFFSET, FLASH_SECTOR_SIZE);
  flash_range_program(FLASH_TARGET_OFFSET, ramData, FLASH_SECTOR_SIZE);
  restore_interrupts(status);
}

void dataMemory_writeByte(uint16_t addr, uint8_t val) {
  loadRamDataFromFlash();
  ramData[addr] = val;
  storeRamDataToFlash();
}

void dataMemory_writeWord(uint16_t addr, uint16_t val) {
  loadRamDataFromFlash();
  ramData[addr] = val & 0xFF;
  ramData[addr + 1] = (val >> 8) & 0xFF;
  storeRamDataToFlash();
}

void dataMemory_writeBytes(uint16_t addr, uint8_t *buf, uint16_t len) {
  loadRamDataFromFlash();
  memcpy(ramData + addr, buf, len);
  storeRamDataToFlash();
}

void dataMemory_clearAllZero() {
  loadRamDataFromFlash();
  memset(ramData, 0, FLASH_SECTOR_SIZE);
  storeRamDataToFlash();
}