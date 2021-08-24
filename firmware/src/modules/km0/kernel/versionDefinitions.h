#pragma once

#define Kermite_ConfigStorageFormatRevision 6
#define Kermite_RawHidMessageProtocolRevision 4
#define Kermite_ProfileBinaryFormatRevision 4
#define Kermite_ConfigParametersRevision 5

#define Kermite_Project_ReleaseBuildRevision EXTR_KERMITE_PROJECT_RELEASE_BUILD_REVISION
#define Kermite_Project_VariationName EXTR_KERMITE_VARIATION_NAME
#define Kermite_Project_IsResourceOriginOnline EXTR_KERMITE_IS_RESOURCE_ORIGIN_ONLINE

#define Kermite_CommonSerialNumberPrefix "A152FD2C"

#if defined KERMITE_TARGET_MCU_ATMEGA
#define Kermite_Project_McuCode "M01"
#elif defined KERMITE_TARGET_MCU_RP2040
#define Kermite_Project_McuCode "M02"
#else
#error KERMITE_TARGET_MCU_* is not defined
#endif
