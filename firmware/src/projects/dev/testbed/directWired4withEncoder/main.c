#include "config.h"
#include "km0/deviceIo/dio.h"
#include "km0/keyboard/generalKeyboard.h"
#include "km0/keyboard/keyScanner_directWired.h"
#include "km0/keyboard/keyScanner_encoderBasic.h"

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
  generalKeyboard_useIndicatorLeds(P_B0, P_D5, true);
  generalKeyboard_useDebugUart(38400);
  keyScanner_directWired_initialize(NumKeyScanSlots, keyInputPins);
  keyScanner_encoderBasic_initialize(2, encoderConfigs);
  generalKeyboard_useKeyScanner(keyScanner_directWired_update);
  generalKeyboard_useKeyScannerExtra(keyScanner_encoderBasic_update);
  generalKeyboard_setKeyIndexTable(keyIndexTable);
  generalKeyboard_start();
  return 0;
}
