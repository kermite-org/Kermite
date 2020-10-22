#include "configStorageValidator.h"

#include "eeprom.h"
#include "utils.h"
#include <stdio.h>

//EEPROMの先頭24バイトを配列データのヘッダ領域, 24~1023番地を配列データ本体に使用
#define EEPROMSIZE 1024
#define CONFIG_DATA_HEADER_LENGTH 24
#define CONFIG_DATA_BODY_LENGTH_MAX (EEPROMSIZE - CONFIG_DATA_HEADER_LENGTH)

#define decode_byte(p) (*(p))
#define decode_word_be(p) ((*(p) << 8) | (*(p + 1)))

static uint8_t eepromTempBuf[12];

bool configStorageValidator_checkDataHeader() {
  eeprom_readBlock(0, eepromTempBuf, 12);
  uint8_t *p = eepromTempBuf;
  uint16_t magicNumber = decode_word_be(p + 0);
  uint16_t reserved0xFFFF = decode_word_be(p + 2);
  uint8_t logicModelType = decode_byte(p + 4);
  uint8_t formatRevision = decode_byte(p + 5);
  uint8_t configBodyStartAddress = decode_byte(p + 6);
  uint8_t numKeys = decode_byte(p + 7);
  uint8_t numLayers = decode_byte(p + 8);
  uint16_t configBodyLength = decode_word_be(p + 9);

  printf("%x %x %x %d %d\n", magicNumber, reserved0xFFFF, logicModelType, numKeys, numLayers);

  bool storageHeaderValid =
      magicNumber == 0xFE03 &&
      reserved0xFFFF == 0xFFFF &&
      logicModelType == 0x01 &&
      formatRevision == CONFIG_STORAGE_FORMAT_REVISION &&
      configBodyStartAddress == CONFIG_DATA_HEADER_LENGTH &&
      numKeys <= 128 &&
      numLayers <= 16 &&
      configBodyLength < CONFIG_DATA_BODY_LENGTH_MAX;

  if (!storageHeaderValid) {
    printf("invalid config memory data\n");
    utils_debugShowBytes(eepromTempBuf, 8);
  } else {
    printf("config memory is valied\n");
  }

  return storageHeaderValid;
}
