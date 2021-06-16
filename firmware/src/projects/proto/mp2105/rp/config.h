#pragma once

#define KERMITE_PROJECT_ID "2xUWcB80"

#define KM0_KEYBOARD__NUM_SCAN_SLOTS 14

#define KM0_RP_SERIAL_LED__PIN_LED GP29
#define KM0_RGB_LIGHTING__NUM_LEDS 12

#define KS_NUM_COLUMNS 4
#define KS_NUM_ROWS 3

#define KS_COLUMN_PINS \
  { GP6, GP7, GP8, GP9 }

#define KS_ROW_PINS \
  { GP20, GP23, GP21 }

#define KS_ENCODER_CONFIG \
  { .pinA = GP26, .pinB = GP22, .scanIndexBase = 12 }
