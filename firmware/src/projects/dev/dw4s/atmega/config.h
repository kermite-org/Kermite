#pragma once

#define KERMITE_FIRMWARE_ID "ZnVSZM"

#define KM0_KEYBOARD__NUM_SCAN_SLOTS 8

#define KM0_ATMEGA_NEOPIXELCORE__PIN_RGBLED F4
#define KM0_RGB_LIGHTING__NUM_LEDS 15
#define KM0_ATMEGA_SINGLEWIRE__PIN_SIGNAL D2

// #define KM0_SPLIT_KEYBOARD__DEBUG_MASTER_SLAVE_DETEMINATION_PIN B2

#define KS_NUM_DIRECT_WIRED_KEYS 4

#define KS_DIRECT_WIRED_KEY_INPUT_PINS \
  { E6, B4, B5, B6 }
