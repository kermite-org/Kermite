#include "localizationKeyMapper.h"
#include "LogicalKeyToHidKeyTable_JP.h"

static uint8_t keyboardLanguage = LocalizationKeyboardLanguage_JP;

void localizationKeyMapper_configureKeyboardLanguage(uint8_t lang) {
  keyboardLanguage = lang;
  //const len = sizeof(LogicalKeyToHidKeyTable_JP) / sizeof(uint16_t);
  //printf("len: %d\n", len); //must be 138
}

uint16_t mapLogicalKeyToHidKey(uint8_t keyPart) {
  uint16_t resHidKey = 0;
  if (keyboardLanguage == LocalizationKeyboardLanguage_JP) {
    uint8_t len = sizeof(LogicalKeyToHidKeyTable_JP) / sizeof(uint16_t);
    //printf("keyPart %d len %d\n", keyPart, len);
    if (keyPart < len) {
      resHidKey = pgm_read_word(LogicalKeyToHidKeyTable_JP + keyPart);
    }
  } else {
  }
  return resHidKey;
}

uint16_t localizationKeyMapper_logicalKeyToHidKey(uint16_t logicalKey) {
  uint16_t modifierFlags = logicalKey & 0x0F00;
  uint8_t keyPart = logicalKey & 0xFF;
  uint16_t resHidKey = mapLogicalKeyToHidKey(keyPart);
  resHidKey |= modifierFlags;
  return resHidKey;
}
