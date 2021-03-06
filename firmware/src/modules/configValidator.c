#include "configValidator.h"
#include "config.h"
#include "eeprom.h"
#include "eepromLayout.h"
#include "utils.h"
#include "versions.h"
#include <stdio.h>

#define decode_byte(p) (*(p))
#define decode_word_be(p) ((*(p) << 8) | (*(p + 1)))

static uint8_t eepromTempBuf[AssignStorageHeaderLength];

bool configValidator_checkDataHeader() {
  eeprom_readBlock(EepromAddr_AssignStorageHeader, eepromTempBuf, AssignStorageHeaderLength);
  uint8_t *p = eepromTempBuf;
  uint16_t magicNumber = decode_word_be(p + 0);
  uint16_t reserved0xFFFF = decode_word_be(p + 2);
  uint8_t logicModelType = decode_byte(p + 4);
  uint8_t formatRevision = decode_byte(p + 5);
  uint8_t configBodyOffset = decode_byte(p + 6);
  uint8_t numKeys = decode_byte(p + 7);
  uint8_t numLayers = decode_byte(p + 8);
  uint16_t configBodyLength = decode_word_be(p + 9);

  // printf("versions: %d %d %d\n", PROJECT_RELEASE_BUILD_REVISION, RAWHID_MESSAGE_PROTOCOL_REVISION, CONFIG_STORAGE_FORMAT_REVISION);
  printf("%x %x %x %d %d\n", magicNumber, reserved0xFFFF, logicModelType, numKeys, numLayers);

  bool storageHeaderValid =
      magicNumber == 0xFE03 &&
      reserved0xFFFF == 0xFFFF &&
      logicModelType == 0x01 &&
      formatRevision == CONFIG_STORAGE_FORMAT_REVISION &&
      configBodyOffset == AssignStorageHeaderLength &&
      numKeys <= 255 &&
      numLayers <= 16 &&
      configBodyLength < AssignStorageBodyLengthMax;

  if (!storageHeaderValid) {
    printf("invalid assign stroage data\n");
    utils_debugShowBytes(eepromTempBuf, AssignStorageHeaderLength);
  } else {
    printf("assign storage is valid\n");
  }

  return storageHeaderValid;
}

void configValidator_initializeEEPROM() {
  eeprom_readBlock(EepromAddr_ProjectID, eepromTempBuf, 8);
  bool projectIdValid = utils_compareBytes(eepromTempBuf, (uint8_t *)PROJECT_ID, 8);
  if (!projectIdValid) {
    printf("clear eeprom for new project\n");
    eeprom_writeBlock(EepromAddr_ProjectID, (uint8_t *)PROJECT_ID, 8);
    for (uint16_t i = EepromAddr_ProjectID + 8; i < 1024; i++) {
      eeprom_writeByte(i, 0);
    }
  }
}