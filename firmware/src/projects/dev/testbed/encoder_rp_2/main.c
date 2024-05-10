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
  { .pinA = GP2, .pinB = GP3, .scanIndexBase = 0 },
  { .pinA = GP4, .pinB = GP5, .scanIndexBase = 2 },
};

int main() {
  // debugUart_initialize(38400);
  boardIoImpl_setupLeds_kb2040();
  keyScanner_encoders_initialize(NumEncoders, encoderConfigs);
  keyboardMain_useKeyScanner(keyScanner_encoders_update);
  generalKeyboard_start();
  return 0;
}
