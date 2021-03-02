
#include "stdint.h"

typedef struct EEPROM_DATA_LAYOUT{
  uint8_t projectId[8];
  uint8_t customSettingsBytes[10];
  uint8_t assignStorageBytes[1024 - 10 - 8];  //1006 bytes
};
