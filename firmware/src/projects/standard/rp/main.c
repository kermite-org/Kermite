#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"

typedef struct {
  uint8_t dataHeader[4];
  uint8_t ledPin;
} KermiteKeyboardDefinitionData;

KermiteKeyboardDefinitionData defs = {
  .dataHeader = { 0x4B, 0x4D, 0x44, 0x46 }, //K,M,D,F
  .ledPin = GP8
};

int main() {
  system_initializeUserProgram();
  boardIo_setupLeds_rpiPico();
  uint8_t ledPin = defs.ledPin;
  digitalIo_setOutput(ledPin);
  while (1) {
    boardIo_toggleLed1();
    digitalIo_toggle(ledPin);
    delayMs(1000);
  }
  return 0;
}
