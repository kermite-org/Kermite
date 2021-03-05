#ifndef __EEPROM_LAYOUT_H__
#define __EEPROM_LAYOUT_H__

#include "config.h"

#define EEPROM_DATA_SIZE_MCU 1024

#ifndef USER_EEPROM_SIZE
#define USER_EEPROM_SIZE 0
#endif

/*
DATA LAYOUT
U = USE_EEPROM_SIZE
(address):(size), DataType
(0):(U), user data
(U):(8), project ID
(U+8):(1), reserved
(U+9):(1), custom parameter bytes initialization flag
(U+10):(10), custom parameter bytes
(U+20):(1024-U-20), assign storage (keymapping data)
*/

#define EepromBaseAddr_UserData 0
#define EepromDataSize_UserData USER_EEPROM_SIZE

#define EepromBaseAddr_Framework USER_EEPROM_SIZE
#define EepromDataSize_Framework (EEPROM_DATA_SIZE_MCU - USER_EEPROM_SIZE)

#define EepromAddr_ProjectID EepromBaseAddr_Framework
#define EepromDataSize_ProjectID 8

#define EepromAddr_CustomSettingsBytesInitializationFlag (EepromBaseAddr_Framework + 9)

#define EepromAddr_CustomSettingsBytes (EepromBaseAddr_Framework + 10)
#define EepromDataSize_CustomSettingsBytes 10

#define EepromBaseAddr_AssignStorage (EepromBaseAddr_Framework + 20)
#define AssignStorageCapacity (EepromDataSize_Framework - 20)

#define EepromAddr_AssignStorageHeader EepromBaseAddr_AssignStorage
#define AssignStorageHeaderLength 12

#define EepromAddr_AssignStorageBody (EepromBaseAddr_AssignStorage + AssignStorageHeaderLength)
#define AssignStorageBodyLengthMax (AssignStorageCapacity - AssignStorageHeaderLength)

#endif