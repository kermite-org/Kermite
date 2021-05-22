#ifndef __KEY_SCANNER_ENCODER_BASIC_H__
#define __KEY_SCANNER_ENCODER_BASIC_H__

#include "km0/types.h"

typedef struct {
  uint8_t pin1;
  uint8_t pin2;
  uint8_t scanIndexBase;
} EncoderConfig;

void keyScanner_encoderBasic_initialize(uint8_t num, EncoderConfig *_encoderConfigs);
void keyScanner_encoderBasic_update(uint8_t *keyStateBitFlags);

#endif