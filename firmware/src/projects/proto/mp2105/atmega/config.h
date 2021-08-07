#pragma once

#define KERMITE_FIRMWARE_ID "2xUWcB"

#define KS_NUM_SCAN_SLOTS 14

#define KS_NUM_RGBLEDS 12
#define KS_RGBLED_PIN P_F4

#define KS_NUM_COLUMNS 4
#define KS_NUM_ROWS 3

#define KS_COLUMN_PINS \
  { P_D7, P_E6, P_B4, P_B5 }

#define KS_ROW_PINS \
  { P_B3, P_B2, P_B6 }

#define KS_ENCODER_CONFIG \
  { .pinA = P_B1, .pinB = P_F7, .scanIndexBase = 12 }
