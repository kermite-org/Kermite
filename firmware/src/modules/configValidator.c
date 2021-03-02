#include "configValidator.h"

#include "eeprom.h"
#include "utils.h"
#include "versions.h"
#include "eepromLayout.h"
#include <stdio.h>

//EEPROMのデータ配置
//[0-7] projectId 8bytes
//[8-17] customSettingsBytes 10bytes
//[18-] assignData
// [18-29] header 12bytes
// [30-] body
#define EEPROMSIZE 1024
#define CONFIG_DATA_HEADER_LENGTH 12
#define CONFIG_DATA_BODY_LENGTH_MAX (EEPROMSIZE - CONFIG_DATA_HEADER_LENGTH - 10 - 8)

#define decode_byte(p) (*(p))
#define decode_word_be(p) ((*(p) << 8) | (*(p + 1)))

static uint8_t eepromTempBuf[12];

bool configValidator_checkDataHeader() {
  eeprom_readBlock(EEPROM_BASE_ADDR_ASSIGN_STORAGE, eepromTempBuf, 12);
  uint8_t *p = eepromTempBuf;
  uint16_t magicNumber = decode_word_be(p + 0);
  uint16_t reserved0xFFFF = decode_word_be(p + 2);
  uint8_t logicModelType = decode_byte(p + 4);
  uint8_t formatRevision = decode_byte(p + 5);
  uint8_t configBodyOffset= decode_byte(p + 6);
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
      configBodyOffset == CONFIG_DATA_HEADER_LENGTH &&
      numKeys <= 255 &&
      numLayers <= 16 &&
      configBodyLength < CONFIG_DATA_BODY_LENGTH_MAX;

  if (!storageHeaderValid) {
    printf("invalid config memory data\n");
    utils_debugShowBytes(eepromTempBuf, 12);
  } else {
    printf("config memory is valid\n");
  }

  return storageHeaderValid;
}
