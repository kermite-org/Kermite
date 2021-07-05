#pragma once

#include "km0/types.h"

typedef struct {
  uint8_t pinA;
  uint8_t pinB;
  uint8_t scanIndexBase;
} EncoderConfig;

void keyScanner_encoders_initialize(uint8_t num, EncoderConfig *_encoderConfigs);
void keyScanner_encoders_update(uint8_t *keyStateBitFlags);
