#ifndef __EEPROM_LAYOUT_H__
#define __EEPROM_LAYOUT_H__

#include "config.h"

#define EEPROM_DATA_SIZE_MCU 1024

#ifndef USER_EEPROM_SIZE
#define USER_EEPROM_SIZE 0
#endif

/*
DATA LAYOUT
U = USER_EEPROM_SIZE

(address):(size), DataType
(0):(8), project ID
(8):(8), device instance code
(16):(1), reserved
(17):(1), custom parameter bytes initialization flag
(18):(10), custom parameter bytes
(28):(1024-U-28), assign storage (keymapping data)
(1024-U):(U), user data

*/

#define EepromBaseAddr_Framework 0
#define EepromDataSize_Framework (EEPROM_DATA_SIZE_MCU - USER_EEPROM_SIZE)

#define EepromAddr_ProjectID EepromBaseAddr_Framework
#define EepromDataSize_ProjectID 8

#define EepromAddr_DeviceInstanceCode (EepromBaseAddr_Framework + 8)
#define EepromDataSize_DeviceInstanceCode 8

#define EepromAddr_CustomSettingsBytesInitializationFlag (EepromBaseAddr_Framework + 17)

#define EepromAddr_CustomSettingsBytes (EepromBaseAddr_Framework + 18)
#define EepromDataSize_CustomSettingsBytes 10

#define EepromBaseAddr_AssignStorage (EepromBaseAddr_Framework + 28)
#define AssignStorageCapacity (EepromDataSize_Framework - 28)

#define EepromAddr_AssignStorageHeader EepromBaseAddr_AssignStorage
#define AssignStorageHeaderLength 12

#define EepromAddr_AssignStorageBody (EepromBaseAddr_AssignStorage + AssignStorageHeaderLength)
#define AssignStorageBodyLengthMax (AssignStorageCapacity - AssignStorageHeaderLength)

#define EepromBaseAddr_UserData (EEPROM_DATA_SIZE_MCU - USER_EEPROM_SIZE)
#define EepromDataSize_UserData USER_EEPROM_SIZE

#endif