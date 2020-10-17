#include "ConfigurationMemoryReader.h"
#include "generalUtils.h"
#include "xf_eeprom.h"
#include <stdio.h>

//---------------------------------------------
//keyassigns memory reader

//EEPROMの先頭24バイトを配列データのヘッダ領域, 24~1023番地を配列データ本体に使用

#define ASSIGN_HEADER_LENGTH 24
#define ASSIGN_DATA_LENGTH_MAX (1024 - ASSIGN_HEADER_LENGTH)

static bool assignMemoryValid = false;
static uint16_t assignDataSize = 0;

uint8_t eepromTempBuf[10];

#define decode_byte(p) (*(p))
#define decode_word_le(p) ((*((p) + 1) << 8) | (*(p)))
#define decode_word_be(p) ((*(p) << 8) | (*(p + 1)))

//---------------------------------------------

// static uint8_t readEepRomByte(uint16_t addr) {
//   return eeprom_read_byte(addr);
// }

static uint16_t readEepRomWordLE(uint16_t addr) {
  uint8_t lowByte = xf_eeprom_read_byte(addr);
  uint8_t highByte = xf_eeprom_read_byte(addr + 1);
  return highByte << 8 | lowByte;
  //return xf_eeprom_read_word(addr);
}

static void initKeyAssignsReader() {
  xf_eeprom_read_block(0, eepromTempBuf, 8);
  uint8_t *p = eepromTempBuf;
  uint16_t magicNumber = decode_word_be(p + 0);
  uint16_t reserved0xFFFF = decode_word_be(p + 2);
  uint8_t logicModelType = decode_byte(p + 4);
  uint8_t formatRevision = decode_byte(p + 5);
  uint8_t assignDataStartLocation = decode_byte(p + 6);
  uint8_t numKeys = decode_byte(p + 7);
  uint8_t numLayers = decode_byte(p + 8);
  uint16_t bodyLength = decode_word_be(p + 9);

  printf("%x %x %x %d %d\n", magicNumber, reserved0xFFFF, logicModelType, numKeys, numLayers);

  assignMemoryValid =
      magicNumber == 0xFE03 &&
      reserved0xFFFF == 0xFFFF &&
      logicModelType == 0x01 &&
      formatRevision == CONFIG_STORAGE_FORMAT_REVISION &&
      assignDataStartLocation == ASSIGN_HEADER_LENGTH &&
      numKeys <= 128 &&
      numLayers <= 16 &&
      bodyLength < ASSIGN_DATA_LENGTH_MAX;

  if (!assignMemoryValid) {
    printf("invalid config memory data\n");
    generalUtils_debugShowBytes(eepromTempBuf, 8);
  } else {
    printf("config memory is valied\n");
  }
}

static uint16_t readKeyAssignMemory(uint16_t wordIndex) {
  uint16_t byteIndex = wordIndex * 2;
  if (assignMemoryValid && byteIndex < assignDataSize) {
    return readEepRomWordLE(ASSIGN_HEADER_LENGTH + byteIndex);
  }
  return 0;
}

//---------------------------------------------
//exports

void configurationMemoryReader_initialize() {
  initKeyAssignsReader();
}

uint16_t configurationMemoryReader_readKeyAssignMemoryWord(uint16_t wordIndex) {
  return readKeyAssignMemory(wordIndex);
}

void configurationMemoryReader_stop() {
  assignMemoryValid = false;
}
