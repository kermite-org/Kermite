#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/scanner/keyScanner_encoderBasic.h"
#include "km0/wrapper/generalKeyboard.h"

#define NumKeyScanSlots 4
#define NumEncoderScanSlots 4
#define NumScanSlots (NumKeyScanSlots + NumEncoderScanSlots)

static const uint8_t keyInputPins[NumKeyScanSlots] = { P_D7, P_E6, P_B4, P_B5 };
static const int8_t keyIndexTable[NumScanSlots] = { 0, 1, 2, 3, 4, 5, 6, 7 };

static EncoderConfig encoderConfigs[] = {
  { .pin1 = P_B6, .pin2 = P_B2, .scanIndexBase = 4 },
  { .pin1 = P_B3, .pin2 = P_B1, .scanIndexBase = 6 },
};

int main() {
  boardIo_setupLeds_proMicroAvr();
  debugUart_initialize(38400);
  keyScanner_directWired_initialize(NumKeyScanSlots, keyInputPins);
  keyScanner_encoderBasic_initialize(encoderConfigs, 2);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
  keyboardMain_useKeyScannerExtra(keyScanner_encoderBasic_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  generalKeyboard_start();
  return 0;
}
