#include "config.h"
#include "km0/device/boardIoImpl.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/scanner/keyScanner_encoders.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumEncoders 2
#define NumScanSlots (NumEncoders * 2)

static EncoderConfig encoderConfigs[NumEncoders] = {
  { .pinA = GP15, .pinB = GP26, .scanIndexBase = 0 },
  { .pinA = GP27, .pinB = GP28, .scanIndexBase = 2 },

};

int main() {
  // debugUart_initialize(38400);
  boardIoImpl_setupLeds_rp2040zero();
  keyScanner_encoders_initialize(NumEncoders, encoderConfigs);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
  keyboardMain_useKeyScanner(keyScanner_encoders_update);
  generalKeyboard_start();
  return 0;
}
