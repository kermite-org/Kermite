#include "config.h"
#include "km0/deviceIo/dio.h"
#include "km0/keyboard/generalKeyboard.h"
#include "km0/keyboard/keyScanner_directWired.h"

#define NumKeys 4

static const uint8_t keyInputPins[NumKeys] = { P_D7, P_E6, P_B4, P_B5 };
static const int8_t keyIndexTable[NumKeys] = { 0, 1, 2, 3 };

int main() {
  generalKeyboard_useIndicatorLeds(P_B0, P_D5, true);
  generalKeyboard_useDebugUart(38400);
  keyScanner_directWired_initialize(NumKeys, keyInputPins);
  generalKeyboard_useKeyScanner(keyScanner_directWired_update);
  generalKeyboard_setKeyIndexTable(keyIndexTable);
  generalKeyboard_start();
  return 0;
}
