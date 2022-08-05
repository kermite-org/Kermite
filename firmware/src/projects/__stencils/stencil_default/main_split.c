#include "km0/base/configImport.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include "km0/kernel/configManager.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/wrapper/splitKeyboard.h"

#ifdef KS_USE_KEY_MATRIX
#include "km0/scanner/keyScanner_basicMatrix.h"
#endif

#ifdef KS_USE_KEYS_DIRECT_WIRED
#include "km0/scanner/keyScanner_directWired.h"
#endif

#ifdef KS_USE_ENCODERS
#include "km0/scanner/keyScanner_encoders.h"
#endif

#ifdef KS_USE_BOARD_LEDS
#include "km0/device/boardIo.h"
#include "km0/device/boardIoImpl.h"
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

#ifdef KS_USE_MOUSE_SENSOR
#include "km0/pointer/pointingDevice.h"
#endif

#ifdef KS_USE_KEYBOARD_STATUS_LEDS
#include "km0/visualizer/keyboardStatusLeds.h"
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
#ifndef KS_MATRIX_SCAN_INDEX_BASE_LEFT
#define KS_MATRIX_SCAN_INDEX_BASE_LEFT 0
#endif
#ifndef KS_MATRIX_SCAN_INDEX_BASE_RIGHT
#define KS_MATRIX_SCAN_INDEX_BASE_RIGHT KM0_KEYBOARD__RIGHTHAND_SCAN_SLOTS_OFFSET
#endif

#endif

#ifdef KS_USE_KEYS_DIRECT_WIRED

#ifndef KS_NUM_DIRECT_WIRED_KEYS_RIGHT
#define KS_NUM_DIRECT_WIRED_KEYS_RIGHT KS_NUM_DIRECT_WIRED_KEYS
#endif
#ifndef KS_DIRECT_WIRED_KEY_INPUT_PINS_RIGHT
#define KS_DIRECT_WIRED_KEY_INPUT_PINS_RIGHT KS_DIRECT_WIRED_KEY_INPUT_PINS
#endif

#ifndef KS_DIRECT_WIRED_KEY_INPUT_SCAN_INDEX_BASE_LEFT
#define KS_DIRECT_WIRED_KEY_INPUT_SCAN_INDEX_BASE_LEFT 0
#endif

#ifndef KS_DIRECT_WIRED_KEY_INPUT_SCAN_INDEX_BASE_RIGHT
#define KS_DIRECT_WIRED_KEY_INPUT_SCAN_INDEX_BASE_RIGHT KM0_KEYBOARD__RIGHTHAND_SCAN_SLOTS_OFFSET
#endif

#endif

#ifdef KS_USE_CUSTOM_KEYINDEX_TABLE
extern const int8_t customData_keyIndexTable[KM0_KEYBOARD__NUM_SCAN_SLOTS];
#endif

#ifdef KS_USE_RGB_LIGHTING
#ifndef KS_NUM_RGBLEDS_RIGHT
#define KS_NUM_RGBLEDS_RIGHT KS_NUM_RGBLEDS
#endif
#endif

static void setupBoard(int8_t side) {

#ifdef KS_USE_KEY_MATRIX
  if (side == 0) {
    static const uint8_t columnPins[KS_NUM_COLUMNS] = KS_COLUMN_PINS;
    static const uint8_t rowPins[KS_NUM_ROWS] = KS_ROW_PINS;
    keyScanner_basicMatrix_initialize(KS_NUM_ROWS, KS_NUM_COLUMNS,
                                      rowPins, columnPins, KS_MATRIX_SCAN_INDEX_BASE_LEFT);
  } else {
    static const uint8_t columnPinsR[KS_NUM_COLUMNS_RIGHT] = KS_COLUMN_PINS_RIGHT;
    static const uint8_t rowPinsR[KS_NUM_ROWS_RIGHT] = KS_ROW_PINS_RIGHT;
    keyScanner_basicMatrix_initialize(KS_NUM_ROWS_RIGHT, KS_NUM_COLUMNS_RIGHT,
                                      rowPinsR, columnPinsR, KS_MATRIX_SCAN_INDEX_BASE_RIGHT);
  }
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);
#endif

#ifdef KS_USE_KEYS_DIRECT_WIRED
  if (side == 0) {
    static const uint8_t directWiredKeyInputPins[KS_NUM_DIRECT_WIRED_KEYS] = KS_DIRECT_WIRED_KEY_INPUT_PINS;
    keyScanner_directWired_initialize(KS_NUM_DIRECT_WIRED_KEYS,
                                      directWiredKeyInputPins, KS_DIRECT_WIRED_KEY_INPUT_SCAN_INDEX_BASE_LEFT);
  } else {
    static const uint8_t directWiredKeyInputPinsR[KS_NUM_DIRECT_WIRED_KEYS_RIGHT] = KS_DIRECT_WIRED_KEY_INPUT_PINS_RIGHT;
    keyScanner_directWired_initialize(KS_NUM_DIRECT_WIRED_KEYS_RIGHT,
                                      directWiredKeyInputPinsR, KS_DIRECT_WIRED_KEY_INPUT_SCAN_INDEX_BASE_RIGHT);
  }
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
#endif

#ifdef KS_USE_ENCODERS

#ifdef KS_ENCODER_CONFIG_LEFT
  if (side == 0) {
    static EncoderConfig encoderConfigsL[1] = { KS_ENCODER_CONFIG_LEFT };
    keyScanner_encoders_initialize(1, encoderConfigsL);
  }
#endif

#ifdef KS_ENCODER_CONFIG_RIGHT
  if (side == 1) {
    static EncoderConfig encoderConfigsR[1] = { KS_ENCODER_CONFIG_RIGHT };
    keyScanner_encoders_initialize(1, encoderConfigsR);
  }
#endif

#ifdef KS_ENCODER_CONFIGS_LEFT
  if (side == 0) {
    static EncoderConfig encoderConfigsL[KS_NUM_ENCODERS_LEFT] = KS_ENCODER_CONFIGS_LEFT;
    keyScanner_encoders_initialize(KS_NUM_ENCODERS_LEFT, encoderConfigsL);
  }
#endif

#ifdef KS_ENCODER_CONFIGS_RIGHT
  if (side == 1) {
    static EncoderConfig encoderConfigsR[KS_NUM_ENCODERS_RIGHT = KS_ENCODER_CONFIGS_RIGHT;
    keyScanner_encoders_initialize(KS_NUM_ENCODERS_LEFT, encoderConfigsR);
  }
#endif
  keyboardMain_useKeyScanner(keyScanner_encoders_update);
#endif

#ifdef KS_USE_RGB_LIGHTING
  if (side == 0) {
    rgbLighting_setNumLeds(KS_NUM_RGBLEDS);
  } else {
    rgbLighting_setNumLeds(KS_NUM_RGBLEDS_RIGHT);
  }
#endif
}

int main() {

#ifdef KS_USE_BOARD_LEDS_PROMICRO_RP
  if (boardIoImpl_setupLeds_proMicroRp) {
    boardIoImpl_setupLeds_proMicroRp();
    configManager_setParameterExposeFlagsForBoardLeds();
  }
#endif

#ifdef KS_USE_BOARD_LEDS_RPI_PICO
  if (boardIoImpl_setupLeds_rpiPico) {
    boardIoImpl_setupLeds_rpiPico();
    configManager_setParameterExposeFlagsForBoardLeds();
  }
#endif

#ifdef KS_USE_DEBUG_UART
  debugUart_initialize(38400);
#else
  system_setupFallbackStdout();
#endif

#ifdef KS_USE_OLED_DISPLAY
  oledDisplay_initialize();
  keyboardMain_useOledDisplayModule(oledDisplay_update);
#endif

#ifdef KS_USE_RGB_LIGHTING
  rgbLighting_preConfigure();
  rgbLighting_initialize(KS_RGBLED_PIN);
  keyboardMain_useRgbLightingModule(rgbLighting_update);
#endif

#ifdef KS_USE_MOUSE_SENSOR
  pointingDevice_initialize();
  keyboardMain_usePointingDevice(pointingDevice_update);
#endif

#ifdef KS_USE_KEYBOARD_STATUS_LEDS
  keyboardStatusLeds_initialize();
  keyboardMain_useHostKeyboardStatusOutputModule(keyboardStatusLeds_update);
#endif

#ifdef KS_USE_CUSTOM_KEYINDEX_TABLE
  keyboardMain_setKeyIndexTable(customData_keyIndexTable);
#endif

  splitKeyboard_setBoardConfigCallback(setupBoard);
  splitKeyboard_start();

  return 0;
}
