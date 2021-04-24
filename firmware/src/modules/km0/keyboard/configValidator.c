#include "configValidator.h"
#include "config.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/dataMemory.h"
#include "storageLayout.h"
#include "versions.h"
#include <stdio.h>

#define decode_byte(p) (*(p))
#define decode_word_be(p) ((*(p) << 8) | (*(p + 1)))

static uint8_t eepromTempBuf[KeyAssignsDataHeaderLength];

bool configValidator_checkDataHeader() {
  dataMemory_readBytes(StorageAddr_KeyAssignsDataHeader, eepromTempBuf, KeyAssignsDataHeaderLength);
  uint8_t *p = eepromTempBuf;
  uint16_t magicNumber = decode_word_be(p + 0);
  uint16_t reserved0xFFFF = decode_word_be(p + 2);
  uint8_t logicModelType = decode_byte(p + 4);
  uint8_t formatRevision = decode_byte(p + 5);
  uint8_t configBodyOffset = decode_byte(p + 6);
  uint8_t numKeys = decode_byte(p + 7);
  uint8_t numLayers = decode_byte(p + 8);
  uint16_t configBodyLength = decode_word_be(p + 9);

  // printf("versions: %d %d %d\n", KERMITE_PROJECT_RELEASE_BUILD_REVISION, KERMITE_RAWHID_MESSAGE_PROTOCOL_REVISION, KERMITE_CONFIG_STORAGE_FORMAT_REVISION);
  printf("%x %x %x %d %d\n", magicNumber, reserved0xFFFF, logicModelType, numKeys, numLayers);

  bool storageHeaderValid =
      magicNumber == 0xFE03 &&
      reserved0xFFFF == 0xFFFF &&
      logicModelType == 0x01 &&
      formatRevision == KERMITE_CONFIG_STORAGE_FORMAT_REVISION &&
      configBodyOffset == KeyAssignsDataHeaderLength &&
      numKeys <= 255 &&
      numLayers <= 16 &&
      configBodyLength < KeyAssignsDataBodyLengthMax;

  if (!storageHeaderValid) {
    printf("invalid assign stroage data\n");
    utils_debugShowBytes(eepromTempBuf, KeyAssignsDataHeaderLength);
  } else {
    printf("assign storage is valid\n");
  }

  return storageHeaderValid;
}

void configValidator_initializeDataStorage() {
  dataMemory_readBytes(StorageAddr_ProjectID, eepromTempBuf, 8);
  bool projectIdValid = utils_compareBytes(eepromTempBuf, (uint8_t *)PROJECT_ID, 8);
  if (!projectIdValid) {
    printf("clear eeprom for new project\n");
    dataMemory_clearAllZero();
    dataMemory_writeBytes(StorageAddr_ProjectID, (uint8_t *)PROJECT_ID, 8);
  }
}