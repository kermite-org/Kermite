#include "hidKeyCombinationManager.h"

uint8_t reportBuffer[8];

uint8_t modifiers = 0;

uint8_t *hidKeyCombinationManager_updateReport(uint16_t hidKey, bool isDown) {
  uint8_t *p = reportBuffer;
  uint8_t modifierBits = hidKey >> 8 & 0xFF;

  if (modifierBits) {
    if (isDown) {
      modifiers |= modifierBits;
    } else {
      modifiers &= ~modifierBits;
    }
  }

  uint8_t keyPart = hidKey & 0xFF;
  p[0] = modifiers;
  p[1] = 0;
  p[2] = isDown ? keyPart : 0;
  p[3] = 0;
  p[4] = 0;
  p[5] = 0;
  p[6] = 0;
  p[7] = 0;
  return p;
}