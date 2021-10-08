#pragma once

#include "km0/types.h"

typedef struct {
  uint8_t dataHeader[5];
  char firmwareId[7];
  char projectId[7];
  char variationId[3];
  char deviceInstanceCode[9];
  char keyboardName[33];
} FirmwareConfigurationData;

extern FirmwareConfigurationData firmwareConfigurationData;
