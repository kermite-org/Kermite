#include "config.h"

#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/wrapper/splitKeyboard.h"

#ifdef KS_USE_KEY_MATRIX
#include "km0/scanner/keyScanner_basicMatrix.h"
#endif

#ifdef KS_USE_KEYS_DIRECT_WIRED
#include "km0/scanner/keyScanner_directWired.h"
#endif

#ifdef KS_USE_ENCODERS
#include "km0/scanner/keyScanner_encoderBasic.h"
#endif

#ifdef KS_USE_BOARD_LEDS
#include "km0/device/boardIo.h"
#endif

#ifdef KS_USE_DEBUG_UART
#include "km0/device/debugUart.h"
#endif

#ifdef KS_USE_OLED_DISPLAY
#include "km0/visualizer/oledDisplay.h"
#endif

#ifdef KS_USE_RGB_LIGHTING
#include "km0/visualizer/rgbLighting.h"
#endif

#ifndef KM0_KEYBOARD__RIGHTHAND_SCAN_SLOTS_OFFSET
#define KM0_KEYBOARD__RIGHTHAND_SCAN_SLOTS_OFFSET (KM0_KEYBOARD__NUM_SCAN_SLOTS / 2)
#endif

#ifdef KS_USE_KEY_MATRIX

#ifndef KS_NUM_COLUMNS_RIGHT
#define KS_NUM_COLUMNS_RIGHT KS_NUM_COLUMNS
#endif
#ifndef KS_NUM_ROWS_RIGHT
#define KS_NUM_ROWS_RIGHT KS_NUM_ROWS
#endif
#ifndef KS_COLUMN_PINS_RIGHT
#define KS_COLUMN_PINS_RIGHT KS_COLUMN_PINS
#endif
#ifndef KS_ROW_PINS_RIGHT
#define KS_ROW_PINS_RIGHT KS_ROW_PINS
#endif

static const uint8_t columnPins[KS_NUM_COLUMNS] = KS_COLUMN_PINS;
static const uint8_t rowPins[KS_NUM_ROWS] = KS_ROW_PINS;

static const uint8_t columnPinsR[KS_NUM_COLUMNS_RIGHT] = KS_COLUMN_PINS_RIGHT;
static const uint8_t rowPinsR[KS_NUM_ROWS_RIGHT] = KS_ROW_PINS_RIGHT;

#endif

#ifdef KS_USE_KEYS_DIRECT_WIRED

#ifndef KS_NUM_DIRECT_WIRED_KEYS_RIGHT
#define KS_NUM_DIRECT_WIRED_KEYS_RIGHT KS_NUM_DIRECT_WIRED_KEYS
#endif
#ifndef KS_DIRECT_WIRED_KEY_INPUT_PINS_RIGHT
#define KS_DIRECT_WIRED_KEY_INPUT_PINS_RIGHT KS_DIRECT_WIRED_KEY_INPUT_PINS
#endif

static const uint8_t directWiredKeyInputPins[KS_NUM_DIRECT_WIRED_KEYS] = KS_DIRECT_WIRED_KEY_INPUT_PINS;
static const uint8_t directWiredKeyInputPinsR[KS_NUM_DIRECT_WIRED_KEYS_RIGHT] = KS_DIRECT_WIRED_KEY_INPUT_PINS_RIGHT;

#endif

#ifdef KS_USE_ENCODERS
static EncoderConfig encoderConfigs[KS_NUM_ENCODERS] = KS_ENCODER_CONFIGS;
#endif

static void setupBoard(int8_t side) {

#ifdef KS_USE_KEY_MATRIX
  if (side == 0) {
    keyScanner_basicMatrix_initialize(KS_NUM_ROWS, KS_NUM_COLUMNS, rowPins, columnPins, 0);
  } else {
    keyScanner_basicMatrix_initialize(KS_NUM_ROWS_RIGHT, KS_NUM_COLUMNS_RIGHT,
                                      rowPinsR, columnPinsR, KM0_KEYBOARD__RIGHTHAND_SCAN_SLOTS_OFFSET);
  }
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
#endif

#ifdef KS_USE_KEYS_DIRECT_WIRED
  if (side == 0) {
    keyScanner_directWired_initialize(KS_NUM_DIRECT_WIRED_KEYS, directWiredKeyInputPins, 0);
  } else {
    keyScanner_directWired_initialize(KS_NUM_DIRECT_WIRED_KEYS_RIGHT,
                                      directWiredKeyInputPinsR, KM0_KEYBOARD__RIGHTHAND_SCAN_SLOTS_OFFSET);
  }
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
#endif

  // #ifdef KS_USE_ENCODERS
  //     keyScanner_encoderBasic_initialize(KS_NUM_ENCODERS, encoderConfigs);
  //     keyboardMain_useKeyScanner(keyScanner_encoderBasic_update);
  // #endif
}

int main() {

#ifdef KS_USE_BOARD_LEDS_PROMICRO_AVR
  boardIo_setupLeds_proMicroAvr();
#endif

#ifdef KS_USE_BOARD_LEDS_PROMICRO_RP
  boardIo_setupLeds_proMicroRp();
#endif

#ifdef KS_USE_BOARD_LEDS_RPI_PICO
  boardIo_setupLeds_rpiPico();
#endif

#ifdef KS_USE_DEBUG_UART
  debugUart_initialize(38400);
#endif

#ifdef KS_USE_OLED_DISPLAY
  oledDisplay_initialize();
  keyboardMain_useOledDisplayModule(oledDisplay_update);
#endif

#ifdef KS_USE_RGB_LIGHTING
  rgbLighting_initialize();
  keyboardMain_useRgbLightingModule(rgbLighting_update);
#endif

  splitKeyboard_setBoardConfigCallback(setupBoard);
  splitKeyboard_start();

  return 0;
}
