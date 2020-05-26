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

uint8_t eepromTempBuf[8];

#define decode_byte(p) (*(p))
#define decode_word_le(p) ((*((p) + 1) << 8) | (*(p)))

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

static void initKeyAssignsReader() { //uint8_t numKeysHardCoded) {
  xf_eeprom_read_block(0, eepromTempBuf, 8);
  uint8_t *p = eepromTempBuf;
  uint16_t magicNumber = decode_word_le(p + 0);
  uint8_t reserved0xFF = decode_byte(p + 2);
  uint8_t logicModelType = decode_byte(p + 3);
  uint8_t formatRevision = decode_byte(p + 4);
  uint8_t assignDataStartLocation = decode_byte(p + 5);
  uint8_t numKeys = decode_byte(p + 6);
  uint8_t numLayers = decode_byte(p + 7);
  bool useDualAssign = decode_byte(p + 8) > 0;

  printf("%x %x %x %d %d %d\n", magicNumber, reserved0xFF, logicModelType, numKeys, numLayers, useDualAssign);

  assignDataSize = (2 * numKeys * numLayers) * (useDualAssign ? 2 : 1);
  assignMemoryValid =
      magicNumber == 0xFE02 &&
      reserved0xFF == 0xFF &&
      logicModelType == 0x01 &&
      formatRevision == 0x01 &&
      assignDataStartLocation == ASSIGN_HEADER_LENGTH &&
      // numKeys == numKeysHardCoded &&
      assignDataSize <= ASSIGN_DATA_LENGTH_MAX;

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

void configurationMemoryReader_initialize() { //uint8_t numKeys) {
  initKeyAssignsReader();                     //numKeys);
}

uint16_t configurationMemoryReader_readKeyAssignMemoryWord(uint16_t wordIndex) {
  return readKeyAssignMemory(wordIndex);
}

void configurationMemoryReader_stop() {
  assignMemoryValid = false;
}
