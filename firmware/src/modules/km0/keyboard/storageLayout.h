#ifndef __STORAGE_LAYOUT_H__
#define __STORAGE_LAYOUT_H__

#include "config.h"

#if defined KERMITE_TARGET_MCU_ATMEGA
#define DEVICE_PERSIST_STORAGE_DATA_SIZE 1024
#elif defined KERMITE_TARGET_MCU_RP2040
#define DEVICE_PERSIST_STORAGE_DATA_SIZE 4096
#else
#error KERMITE_TARGET_MCU_* is not defined
#endif

#ifndef KM0_STORAGE__USER_STORAZE_SIZE
#define KM0_STORAGE__USER_STORAZE_SIZE 0
#endif

/*
DATA LAYOUT
SZ = DEVICE_PERSIST_STORAGE_DATA_SIZE
U = KM0_STORAGE__USER_STORAZE_SIZE

(address):(size), DataType
(0):(8), project ID
(8):(8), device instance code
(16):(1), reserved
(17):(1), custom parameter bytes initialization flag
(18):(10), custom parameter bytes
(28):(SZ-U-28), assign storage (keymapping data)
(SZ-U):(U), user data

*/

#define StorageBaseAddr_Framework 0
#define StorageDataSize_Framework (DEVICE_PERSIST_STORAGE_DATA_SIZE - KM0_STORAGE__USER_STORAZE_SIZE)

#define StorageAddr_ProjectID StorageBaseAddr_Framework
#define StorageDataSize_ProjectID 8

#define StorageAddr_DeviceInstanceCode (StorageBaseAddr_Framework + 8)
#define StorageDataSize_DeviceInstanceCode 8

#define StorageAddr_CustomSettingsBytesInitializationFlag (StorageBaseAddr_Framework + 17)

#define StorageAddr_CustomSettingsBytes (StorageBaseAddr_Framework + 18)
#define StorageDataSize_CustomSettingsBytes 10

#define StorageBaseAddr_KeyAssignsData (StorageBaseAddr_Framework + 28)
#define KeyAssignsDataCapacity (StorageDataSize_Framework - 28)

#define StorageAddr_KeyAssignsDataHeader StorageBaseAddr_KeyAssignsData
#define KeyAssignsDataHeaderLength 12

#define StorageAddr_KeyAssignsDataBody (StorageBaseAddr_KeyAssignsData + KeyAssignsDataHeaderLength)
#define KeyAssignsDataBodyLengthMax (KeyAssignsDataCapacity - KeyAssignsDataHeaderLength)

#define StorageBaseAddr_UserData (DEVICE_PERSIST_STORAGE_DATA_SIZE - KM0_STORAGE__USER_STORAZE_SIZE)
#define StorageDataSize_UserData KM0_STORAGE__USER_STORAZE_SIZE

#endif