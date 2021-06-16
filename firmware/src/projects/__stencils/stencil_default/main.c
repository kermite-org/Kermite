#include "config.h"

#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/wrapper/generalKeyboard.h"

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

#ifdef KS_USE_KEY_MATRIX
#ifndef KS_MATRIX_SCAN_INDEX_BASE
#define KS_MATRIX_SCAN_INDEX_BASE 0
#endif
  static const uint8_t columnPins[KS_NUM_COLUMNS] = KS_COLUMN_PINS;
  static const uint8_t rowPins[KS_NUM_ROWS] = KS_ROW_PINS;
  keyScanner_basicMatrix_initialize(KS_NUM_ROWS, KS_NUM_COLUMNS,
                                    rowPins, columnPins, KS_MATRIX_SCAN_INDEX_BASE);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
#endif

#ifdef KS_USE_KEYS_DIRECT_WIRED
#ifndef KS_DIRECT_WIRED_KEY_INPUT_SCAN_INDEX_BASE
#define KS_DIRECT_WIRED_KEY_INPUT_SCAN_INDEX_BASE 0
#endif
  static const uint8_t directWiredKeyInputPins[KS_NUM_DIRECT_WIRED_KEYS] = KS_DIRECT_WIRED_KEY_INPUT_PINS;
  keyScanner_directWired_initialize(KS_NUM_DIRECT_WIRED_KEYS,
                                    directWiredKeyInputPins, KS_DIRECT_WIRED_KEY_INPUT_SCAN_INDEX_BASE);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
#endif

#ifdef KS_USE_ENCODERS

#if defined(KS_ENCODER_CONFIG)
#define KS_NUM_ENCODERS 1
  static EncoderConfig encoderConfigs[1] = { KS_ENCODER_CONFIG };
#elif defined(KS_ENCODER_CONFIGS)
  static EncoderConfig encoderConfigs[KS_NUM_ENCODERS] = KS_ENCODER_CONFIGS;
#endif
  keyboardMain_useKeyScanner(keyScanner_encoderBasic_update);
  keyScanner_encoderBasic_initialize(KS_NUM_ENCODERS, encoderConfigs);
#endif

  generalKeyboard_start();

  return 0;
}
