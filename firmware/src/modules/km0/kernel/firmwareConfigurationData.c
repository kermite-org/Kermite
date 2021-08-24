#include "firmwareConfigurationData.h"
#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "km0/types.h"

#ifndef KERMITE_FIRMWARE_ID
#error KERMITE_FIRMWARE_ID is not defined
#endif

#ifndef KERMITE_KEYBOARD_NAME
#error KERMITE_KEYBOARD_NAME is not defined
#endif

FirmwareConfigurationData firmwareConfigurationData = {
  .firmwareId = KERMITE_FIRMWARE_ID,
  .projectId = "000000",
  .keyboardName = KERMITE_KEYBOARD_NAME
};