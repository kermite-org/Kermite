#ifndef __VERSION_DEFINITIONS_H__

#define Kermite_ConfigStorageFormatRevision 6
#define Kermite_RawHidMessageProtocolRevision 2
#define Kermite_ProfileBinaryFormatRevision 4
#define Kermite_ConfigParametersRevision 3

#define Kermite_Project_ReleaseBuildRevision EXTR_KERMITE_PROJECT_RELEASE_BUILD_REVISION
#define Kermite_Project_VariationName EXTR_KERMITE_VARIATION_NAME
#define Kermite_Project_IsResourceOriginOnline EXTR_KERMITE_IS_RESOURCE_ORIGIN_ONLINE

#if defined KERMITE_TARGET_MCU_ATMEGA
#define Kermite_Project_McuCode "A152FD20"
#elif defined KERMITE_TARGET_MCU_RP2040
#define Kermite_Project_McuCode "A152FD21"
#else
#error KERMITE_TARGET_MCU_* is not defined
#endif

#endif