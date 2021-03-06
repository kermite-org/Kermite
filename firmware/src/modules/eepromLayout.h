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

(0):(8), project ID
(8):(1), reserved
(9):(1), custom parameter bytes initialization flag
(10):(10), custom parameter bytes
(20):(1024-U-20), assign storage (keymapping data)

(1024-U):(U), user data

*/

#define EepromBaseAddr_Framework 0
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

#define EepromBaseAddr_UserData (EEPROM_DATA_SIZE_MCU - USER_EEPROM_SIZE)
#define EepromDataSize_UserData USER_EEPROM_SIZE

#endif