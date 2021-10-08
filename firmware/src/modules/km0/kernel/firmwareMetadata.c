#include "firmwareMetadata.h"
#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "km0/types.h"

#ifndef KERMITE_FIRMWARE_ID
#error KERMITE_FIRMWARE_ID is not defined
#endif

#ifndef KERMITE_KEYBOARD_NAME
#error KERMITE_KEYBOARD_NAME is not defined
#endif

CommonFirmwareMetadata commonFirmwareMetadata = {
  .dataHeader = { '$', 'K', 'M', 'M', 'D' },
  .projectId = "000000",
  .variationId = "00",
  .deviceInstanceCode = "00000000",
  .keyboardName = KERMITE_KEYBOARD_NAME,
};