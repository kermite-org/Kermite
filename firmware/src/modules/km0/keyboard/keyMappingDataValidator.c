#include "config.h"
#include "dataStorage.h"
#include "keyMappingDataValidator.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/dataMemory.h"
#include "versionDefinitions.h"
#include <stdio.h>

//----------------------------------------------------------------------

#define decode_byte(p) (*(p))
#define decode_word_be(p) ((*(p) << 8) | (*(p + 1)))

#define KeyAssignsDataHeaderLength 5

static uint8_t eepromTempBuf[KeyAssignsDataHeaderLength];

bool keyMappingDataValidator_checkBinaryProfileDataHeader() {
  uint16_t addrKeyAssignsDataHeader = dataStorage_getDataAddress_profileData_profileHeader();
  uint16_t keyAssignsDataBodyLengthMax = dataStorage_getKeyAssignDataCapacity();
  bool storageHeaderValid = false;
  if (addrKeyAssignsDataHeader && keyAssignsDataBodyLengthMax) {
    dataMemory_readBytes(addrKeyAssignsDataHeader, eepromTempBuf, KeyAssignsDataHeaderLength);
    uint8_t *p = eepromTempBuf;
    uint8_t logicModelType = decode_byte(p + 0);
    uint8_t configStorageFormatRevision = decode_byte(p + 1);
    uint8_t profileBinaryFormatRevision = decode_byte(p + 2);
    uint8_t numKeys = decode_byte(p + 3);
    uint8_t numLayers = decode_byte(p + 4);
    // printf("%d %d %d %d %d\n", logicModelType, configStorageFormatRevision, profileBinaryFormatRevision, numKeys, numLayers);
    storageHeaderValid =
        logicModelType == 0x01 &&
        configStorageFormatRevision == Kermite_ConfigStorageFormatRevision &&
        profileBinaryFormatRevision == Kermite_ProfileBinaryFormatRevision &&
        numKeys <= 254 &&
        numLayers <= 16;
  }

  if (!storageHeaderValid) {
    printf("invalid key assigns data\n");
    // utils_debugShowBytes(eepromTempBuf, KeyAssignsDataHeaderLength);
  } else {
    printf("key assigns storage data is valid\n");
  }

  return storageHeaderValid;
}
