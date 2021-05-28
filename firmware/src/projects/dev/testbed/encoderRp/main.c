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

static const uint8_t keyInputPins[NumKeyScanSlots] = { GP12, GP13, GP14, GP15 };
static const int8_t keyIndexTable[NumScanSlots] = { 0, 1, 2, 3, 4, 5 };

static EncoderConfig encoderConfigs[] = {
  { .pinA = GP21, .pinB = GP20, .scanIndexBase = 4 },
};

int main() {
  debugUart_initialize(115200);
  boardIo_setupLeds_rpiPico();
  keyScanner_directWired_initialize(NumKeyScanSlots, keyInputPins);
  keyScanner_encoderBasic_initialize(encoderConfigs, 2);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
  keyboardMain_useKeyScannerExtra(keyScanner_encoderBasic_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  generalKeyboard_start();
  return 0;
}
