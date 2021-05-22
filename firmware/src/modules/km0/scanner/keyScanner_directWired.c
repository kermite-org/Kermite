#include "keyScanner_directWired.h"
#include "km0/base/bitOperations.h"
#include "km0/base/utils.h"
#include "km0/device/digitalIo.h"

#ifndef KM0_KEYSCANNER_DIRECTWIRED__SCAN_SLOT_INDEX_BASE
#define KM0_KEYSCANNER_DIRECTWIRED__SCAN_SLOT_INDEX_BASE 0
#endif

static const uint8_t scanSlotIndexBase = KM0_KEYSCANNER_DIRECTWIRED__SCAN_SLOT_INDEX_BASE;

static uint8_t numPins;
static const uint8_t *pins;

void keyScanner_directWired_initialize(uint8_t _numPins, const uint8_t *_pins) {
  numPins = _numPins;
  pins = _pins;
  for (uint8_t i = 0; i < numPins; i++) {
    digitalIo_setInputPullup(pins[i]);
  }
}

void keyScanner_directWired_update(uint8_t *keyStateBitFlags) {
  for (uint8_t i = 0; i < numPins; i++) {
    bool isDown = digitalIo_read(pins[i]) == 0;
    utils_writeArrayedBitFlagsBit(keyStateBitFlags, scanSlotIndexBase + i, isDown);
  }
}