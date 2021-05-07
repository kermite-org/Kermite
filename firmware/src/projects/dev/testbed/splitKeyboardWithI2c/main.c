#include "config.h"
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/dio.h"
#include "km0/keyboard/keyScanner_directWired.h"
#include "km0/keyboard/keyboardMain.h"
#include "km0/keyboard/splitKeyboard.h"

#define NumScanSlotsHalf 4
#define NumScanSlots (NumScanSlotsHalf * 2)

static const uint8_t keyInputPins[NumScanSlotsHalf] = { GP12, GP13, GP14, GP15 };

static const int8_t keyIndexTable[NumScanSlots] = {
  //left
  0, 1, 2, 3,
  //right
  4, 5, 6, 7
};

int main() {
  boardIo_setupLeds_rpiPico();
  keyboardMain_useDebugUart(115200);
  keyScanner_directWired_initialize(NumScanSlotsHalf, keyInputPins);
  keyboardMain_useKeyScanner(keyScanner_directWired_update);
  keyboardMain_setKeyIndexTable(keyIndexTable);
  splitKeyboard_start();
  return 0;
}
