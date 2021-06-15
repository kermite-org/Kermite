#include "keyScanner_directWired.h"
#include "km0/base/bitOperations.h"
#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "km0/device/digitalIo.h"

static uint8_t numPins = 0;
static const uint8_t *pins;
static uint8_t scanIndexBase;

void keyScanner_directWired_initialize(uint8_t _numPins, const uint8_t *_pins, uint8_t _scanIndexBase) {
  numPins = _numPins;
  pins = _pins;
  scanIndexBase = _scanIndexBase;
  for (uint8_t i = 0; i < numPins; i++) {
    digitalIo_setInputPullup(pins[i]);
  }
}

void keyScanner_directWired_update(uint8_t *keyStateBitFlags) {
  for (uint8_t i = 0; i < numPins; i++) {
    bool isDown = digitalIo_read(pins[i]) == 0;
    utils_writeArrayedBitFlagsBit(keyStateBitFlags, scanIndexBase + i, isDown);
  }
}