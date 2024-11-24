#include "config.h"
#include "km0/device/boardIoImpl.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/scanner/keyScanner_encoders.h"
#include "km0/wrapper/splitKeyboard.h"

static uint8_t pins_directWired[] = { GP9 };

static void setupBoard(int8_t side) {
  if (side == 0) {
    static EncoderConfig encoderConfigs[1] = {
      { .pinA = GP4, .pinB = GP5, .scanIndexBase = 0 },
    };
    keyScanner_directWired_initialize(1, pins_directWired, 2);
    keyboardMain_useKeyScanner(keyScanner_directWired_update);
    keyScanner_encoders_initialize(1, encoderConfigs);
    keyboardMain_useKeyScanner(keyScanner_encoders_update);
  } else {
    static EncoderConfig encoderConfigs[1] = {
      { .pinA = GP4, .pinB = GP5, .scanIndexBase = 3 },
    };
    keyScanner_directWired_initialize(1, pins_directWired, 5);
    keyboardMain_useKeyScanner(keyScanner_directWired_update);
    keyScanner_encoders_initialize(1, encoderConfigs);
    keyboardMain_useKeyScanner(keyScanner_encoders_update);
  }
}

int main() {
  // debugUart_initialize(115200);
  boardIoImpl_setupLeds_kb2040();
  splitKeyboard_setBoardConfigCallback(setupBoard);
  splitKeyboard_start();
  return 0;
}
