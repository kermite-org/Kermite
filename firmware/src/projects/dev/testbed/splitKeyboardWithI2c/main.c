#include "config.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/kernel/keyboardMain.h"
#include "km0/scanner/keyScanner_directWired.h"
#include "km0/wrapper/splitKeyboard.h"

#define NumScanSlotsHalf 4
#define NumScanSlots (NumScanSlotsHalf * 2)

static const uint8_t keyInputPins[NumScanSlotsHalf] = { GP12, GP13, GP14, GP15 };

static void setupBoard(int8_t side) {
  uint8_t scanOffset = side == 0 ? 0 : 4;
  keyScanner_directWired_initialize(NumScanSlotsHalf, keyInputPins, scanOffset);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
}

int main() {
  boardIo_setupLeds_rpiPico();
  debugUart_initialize(115200);
  splitKeyboard_setBoardConfigCallback(setupBoard);
  splitKeyboard_start();
  return 0;
}
