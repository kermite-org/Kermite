#pragma once

#define KERMITE_PROJECT_ID "Di6V4KvF"

#define KS_SNGLEWIRE_PIN_PD2

//左右非対称のキーマトリクスを実験
#define KS_NUM_SCAN_SLOTS 60
#define KS_RIGHTHAND_SCAN_SLOTS_OFFSET 40

#define KS_NUM_COLUMNS 8
#define KS_NUM_ROWS 5
#define KS_COLUMN_PINS \
  { P_F4, P_F5, P_F6, P_F7, P_B1, P_B3, P_B2, P_B6 }
#define KS_ROW_PINS \
  { P_C6, P_D7, P_E6, P_B4, P_B5 }

#define KS_NUM_COLUMNS_RIGHT 4
#define KS_NUM_ROWS_RIGHT 5
#define KS_COLUMN_PINS_RIGHT \
  { P_F6, P_F7, P_B1, P_B3 }
#define KS_ROW_PINS_RIGHT \
  { P_C6, P_D7, P_E6, P_B4, P_B5 }
