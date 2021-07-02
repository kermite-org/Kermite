#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/scanner/keyScanner_encoders.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumKeys 4
#define NumEncoders 1
#define NumScanSlots (NumKeys + NumEncoders * 2)

static const uint8_t keyInputPins[NumKeys] = { GP12, GP13, GP14, GP15 };

static EncoderConfig encoderConfigs[NumEncoders] = {
  { .pinA = GP21, .pinB = GP20, .scanIndexBase = 4 },
};

int main() {
  // debugUart_initialize(38400);
  boardIo_setupLeds_rpiPico();
  keyScanner_directWired_initialize(NumKeys, keyInputPins, 0);
  keyScanner_encoders_initialize(NumEncoders, encoderConfigs);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
  keyboardMain_useKeyScanner(keyScanner_encoders_update);
  generalKeyboard_start();
  return 0;
}
