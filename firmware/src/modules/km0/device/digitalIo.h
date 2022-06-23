#pragma once

#include "km0/types.h"

#if defined(KERMITE_TARGET_MCU_RP2040) || defined(IDE_SYNTAX_CHECK)
enum {
  GP0 = 0,
  GP1,
  GP2,
  GP3,
  GP4,
  GP5,
  GP6,
  GP7,
  GP8,
  GP9,
  GP10,
  GP11,
  GP12,
  GP13,
  GP14,
  GP15,
  GP16,
  GP17,
  GP18,
  GP19,
  GP20,
  GP21,
  GP22,
  GP23,
  GP24,
  GP25,
  GP26,
  GP27,
  GP28,
  GP29,
};
#endif

void digitalIo_setOutput(uint8_t pin);
void digitalIo_setInput(uint8_t pin);
void digitalIo_setInputPullup(uint8_t pin);
void digitalIo_write(uint8_t pin, bool val);
bool digitalIo_read(uint8_t pin);
void digitalIo_toggle(uint8_t pin);
void digitalIo_setHigh(uint8_t pin);
void digitalIo_setLow(uint8_t pin);
void digitalIo_pseudoOpenDrain_init(uint8_t pin);
void digitalIo_pseudoOpenDrain_write(uint8_t pin, bool val);
bool digitalIo_pseudoOpenDrain_read(uint8_t pin);
