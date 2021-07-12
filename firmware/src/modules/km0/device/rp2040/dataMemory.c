#include "km0/device/dataMemory.h"
#include "pico_sdk/src/common/include/pico/stdlib.h"
#include "pico_sdk/src/rp2_common/include/hardware/flash.h"
#include "pico_sdk/src/rp2_common/include/hardware/sync.h"
#include <string.h>

#define FLASH_TARGET_OFFSET (256 * 1024)

//----------------------------------------------------------------------

static uint8_t ramData[FLASH_SECTOR_SIZE] = { 0 };

static const uint8_t *ptrFlashRomData = (const uint8_t *)(XIP_BASE + FLASH_TARGET_OFFSET);

static uint32_t saveCount = 0;

static void loadRamDataFromFlash() {
  memcpy(ramData, ptrFlashRomData, FLASH_SECTOR_SIZE);
}

static void storeRamDataToFlash() {
  uint32_t status = save_and_disable_interrupts();
  flash_range_erase(FLASH_TARGET_OFFSET, FLASH_SECTOR_SIZE);
  flash_range_program(FLASH_TARGET_OFFSET, ramData, FLASH_SECTOR_SIZE);
  restore_interrupts(status);
}

static void saveLazy() {
  saveCount = 1000;
}

static void processSaving() {
  if (saveCount > 0) {
    saveCount--;
    if (saveCount == 0) {
      storeRamDataToFlash();
    }
  }
}

//----------------------------------------------------------------------

uint16_t dataMemory_getCapacity() {
  return FLASH_SECTOR_SIZE;
}

uint8_t dataMemory_readByte(uint16_t addr) {
  return ramData[addr];
}

uint16_t dataMemory_readWord(uint16_t addr) {
  uint8_t lo = ramData[addr];
  uint8_t hi = ramData[addr + 1];
  return (hi << 8) | lo;
}

void dataMemory_readBytes(uint16_t addr, uint8_t *buf, uint16_t len) {
  memcpy(buf, ramData + addr, len);
}

void dataMemory_writeByte(uint16_t addr, uint8_t val) {
  ramData[addr] = val;
  saveLazy();
}

void dataMemory_writeWord(uint16_t addr, uint16_t val) {
  ramData[addr] = val & 0xFF;
  ramData[addr + 1] = (val >> 8) & 0xFF;
  saveLazy();
}

void dataMemory_writeBytes(uint16_t addr, uint8_t *buf, uint16_t len) {
  memcpy(ramData + addr, buf, len);
  saveLazy();
}

void dataMemory_clearAllZero() {
  memset(ramData, 0, FLASH_SECTOR_SIZE);
  saveLazy();
}

void dataMemory_initialize() {
  loadRamDataFromFlash();
}

void dataMemory_processTick() {
  processSaving();
}