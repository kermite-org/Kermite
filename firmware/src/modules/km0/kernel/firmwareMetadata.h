#pragma once

#include "km0/types.h"

typedef struct {
  uint8_t dataHeader[5];
  char projectId[7];
  char variationId[3];
  char deviceInstanceCode[9];
  char keyboardName[33];
} CommonFirmwareMetadata;

extern CommonFirmwareMetadata commonFirmwareMetadata;
