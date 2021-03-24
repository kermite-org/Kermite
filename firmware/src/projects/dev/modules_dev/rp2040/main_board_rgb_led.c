#include "boardLED.h"
#include "dio.h"
#include "system.h"

int main() {
  boardLED_initRgbLED(GP25);
  while (true) {
    boardLED_outputLED1(true);
    delayMs(1);
    boardLED_outputLED2(false);
    delayMs(1000);
    boardLED_outputLED1(false);
    delayMs(1);
    boardLED_outputLED2(true);
    delayMs(1000);
  }
}
