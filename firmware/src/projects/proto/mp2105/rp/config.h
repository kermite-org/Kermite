#pragma once

#define KERMITE_FIRMWARE_ID "2xUWcB"

#define KS_NUM_SCAN_SLOTS 14

#define KS_NUM_RGBLEDS 12
#define KS_RGBLED_PIN GP29

#define KS_NUM_COLUMNS 4
#define KS_NUM_ROWS 3

#define KS_COLUMN_PINS \
  { GP6, GP7, GP8, GP9 }

#define KS_ROW_PINS \
  { GP20, GP23, GP21 }

#define KS_ENCODER_CONFIG \
  { .pinA = GP26, .pinB = GP22, .scanIndexBase = 12 }
