#pragma once

#define KERMITE_PROJECT_ID "RcYEeq"

#define KM0_ATMEGA_SINGLEWIRE__PIN_SIGNAL D2
#define KM0_KEYBOARD__NUM_SCAN_SLOTS 8

#define KS_NUM_DIRECT_WIRED_KEYS 2

#define KS_DIRECT_WIRED_KEY_INPUT_PINS \
  { E6, B6 }

#define KS_ENCODER_CONFIG_LEFT \
  { .pinA = B4, .pinB = B5, .scanIndexBase = 2 }

#define KS_ENCODER_CONFIG_RIGHT \
  { .pinA = B4, .pinB = B5, .scanIndexBase = 6 }
