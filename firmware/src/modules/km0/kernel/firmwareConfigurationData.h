#pragma once

#include "km0/types.h"

typedef struct {
  char firmwareId[7];
  char projectId[7];
  char keyboardName[33];
} FirmwareConfigurationData;

extern FirmwareConfigurationData firmwareConfigurationData;