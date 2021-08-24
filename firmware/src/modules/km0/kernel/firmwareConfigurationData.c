#include "firmwareConfigurationData.h"
#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "km0/types.h"

#ifndef KERMITE_FIRMWARE_ID
#error KERMITE_FIRMWARE_ID is not defined
#endif

#ifndef KERMITE_KEYBOARD_NAME
#define KERMITE_KEYBOARD_NAME "unnamed keyboard"
#endif

FirmwareConfigurationData firmwareConfigurationData = {
  .firmwareId = KERMITE_FIRMWARE_ID,
  .projectId = "00000000",
  .keyboardName = KERMITE_KEYBOARD_NAME
};