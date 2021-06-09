#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/scanner/keyScanner_encoderBasic.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumKeys 4
#define NumEncoders 2
#define NumScanSlots (NumKeys + NumEncoders * 2)

static const uint8_t keyInputPins[NumKeys] = { P_D7, P_E6, P_B4, P_B5 };
static const int8_t keyIndexTable[NumScanSlots] = { 0, 1, 2, 3, 4, 5, 6, 7 };

static EncoderConfig encoderConfigs[NumEncoders] = {
  { .pinA = P_B6, .pinB = P_B2, .scanIndexBase = 4 },
  { .pinA = P_B3, .pinB = P_B1, .scanIndexBase = 6 },
};

int main() {
  boardIo_setupLeds_proMicroAvr();
  debugUart_initialize(38400);
  keyScanner_directWired_initialize(NumKeys, keyInputPins);
  keyScanner_encoderBasic_initialize(NumEncoders, encoderConfigs);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
  keyboardMain_useKeyScanner(keyScanner_encoderBasic_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  generalKeyboard_start();
  return 0;
}
