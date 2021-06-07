#ifndef __KEY_SCANNER_ENCODER_BASIC_H__
#define __KEY_SCANNER_ENCODER_BASIC_H__

#include "km0/types.h"

typedef struct {
  uint8_t pinA;
  uint8_t pinB;
  uint8_t scanIndexBase;
} EncoderConfig;

void keyScanner_encoderBasic_initialize(uint8_t num, EncoderConfig *_encoderConfigs);

#endif