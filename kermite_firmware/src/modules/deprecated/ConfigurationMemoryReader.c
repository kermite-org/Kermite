#include "ConfigurationMemoryReader.h"
#include "generalUtils.h"
#include "xf_eeprom.h"
#include <stdio.h>

//EEPROMの先頭24バイトを配列データのヘッダ領域, 24~1023番地を配列データ本体に使用
#define CONFIG_DATA_HEADER_LENGTH 24
#define CONFIG_DATA_BODY_LENGTH_MAX (1024 - CONFIG_DATA_HEADER_LENGTH)

#define decode_byte(p) (*(p))
#define decode_word_be(p) ((*(p) << 8) | (*(p + 1)))

static bool configDataValid = false;
static uint16_t configDataEndAddress = 0;
static uint8_t eepromTempBuf[12];

void configurationMemoryReader_initialize() {
  xf_eeprom_read_block(0, eepromTempBuf, 12);
  uint8_t *p = eepromTempBuf;
  uint16_t magicNumber = decode_word_be(p + 0);
  uint16_t reserved0xFFFF = decode_word_be(p + 2);
  uint8_t logicModelType = decode_byte(p + 4);
  uint8_t formatRevision = decode_byte(p + 5);
  uint8_t configBodyStartLocation = decode_byte(p + 6);
  uint8_t numKeys = decode_byte(p + 7);
  uint8_t numLayers = decode_byte(p + 8);
  uint16_t configBodyLength = decode_word_be(p + 9);

  printf("%x %x %x %d %d\n", magicNumber, reserved0xFFFF, logicModelType, numKeys, numLayers);

  configDataValid =
      magicNumber == 0xFE03 &&
      reserved0xFFFF == 0xFFFF &&
      logicModelType == 0x01 &&
      formatRevision == CONFIG_STORAGE_FORMAT_REVISION &&
      configBodyStartLocation == CONFIG_DATA_HEADER_LENGTH &&
      numKeys <= 128 &&
      numLayers <= 16 &&
      configBodyLength < CONFIG_DATA_BODY_LENGTH_MAX;

  configDataEndAddress = configBodyStartLocation + configBodyLength;

  if (!configDataValid) {
    printf("invalid config memory data\n");
    generalUtils_debugShowBytes(eepromTempBuf, 8);
  } else {
    printf("config memory is valied\n");
  }
}

uint8_t configurationMemoryReader_readConfigStorageByte(uint16_t addr) {
  if (configDataValid && addr < configDataEndAddress) {
    return xf_eeprom_read_byte(addr);
  }
  return 0;
}

void configurationMemoryReader_stop() {
  configDataValid = false;
}
