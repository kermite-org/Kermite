#include "config.h"

#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_basicMatrix.h"

#ifdef KS_USE_PROMICRO_BOARD_LEDS
#include "km0/device/boardIo.h"
#endif

#ifdef KS_USE_DEBUG_UART
#include "km0/device/debugUart.h"
#endif

#ifdef KS_USE_OLED
#include "km0/visualizer/oledDisplay.h"
#endif

#ifdef KS_USE_RGB_LIGHTING
#include "km0/visualizer/rgbLighting.h"
#endif

#ifdef KS_USE_SPLIT_KEYBOARD
#include "km0/wrapper/splitKeyboard.h"
#else
#include "km0/wrapper/generalKeyboard.h"
#endif

static const uint8_t columnPins[KS_NUM_COLUMNS] = KS_COLUMN_PINS;
static const uint8_t rowPins[KS_NUM_ROWS] = KS_ROW_PINS;

int main() {

#ifdef KS_USE_PROMICRO_BOARD_LEDS
  boardIo_setupLeds_proMicroAvr();
#endif

#ifdef KS_USE_DEBUG_UART
  debugUart_initialize(38400);
#endif

#ifdef KS_USE_OLED
  oledDisplay_initialize();
  keyboardMain_useVisualModule(oledDisplay_update);
#endif

#ifdef KS_USE_RGB_LIGHTING
  rgbLighting_initialize();
  keyboardMain_useVisualModule(rgbLighting_update);
#endif

  keyScanner_basicMatrix_initialize(KS_NUM_ROWS, KS_NUM_COLUMNS, rowPins, columnPins);
  keyboardMain_useKeyScanner(keyScanner_basicMatrix_update);

#ifdef KS_USE_SPLIT_KEYBOARD
  splitKeyboard_start();
#else
  generalKeyboard_start();
#endif
  return 0;
}
