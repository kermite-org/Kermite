#ifndef __LOCALIZATION_KEY_MAPPER_H__
#define __LOCALIZATION_KEY_MAPPER_H__

#include "types.h"

enum {
  LocalizationKeyboardLanguage_US = 1,
  LocalizationKeyboardLanguage_JP = 2,
  //LOCALIZATION_KBD_LANGUAGE_US = 1,
  //LOCALIZATION_KBD_LANGUAGE_JP = 2,
};

void localizationKeyMapper_configureKeyboardLanguage(uint8_t lang);

//logicalKey --> hidKey
uint16_t localizationKeyMapper_logicalKeyToHidKey(uint16_t logicalKey);

#endif