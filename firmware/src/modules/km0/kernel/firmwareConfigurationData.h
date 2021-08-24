#pragma once

#include "km0/types.h"

typedef struct {
  char firmwareId[7];
  char projectId[9];
  char keyboardName[21];
} FirmwareConfigurationData;

extern FirmwareConfigurationData firmwareConfigurationData;