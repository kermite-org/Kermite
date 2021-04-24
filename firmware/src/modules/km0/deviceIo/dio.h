#ifndef __PIO_H__
#define __PIO_H__

#include "km0/types.h"

#ifdef TARGET_MCU_ATMEGA
enum {
  P_B0 = 0,
  P_B1,
  P_B2,
  P_B3,
  P_B4,
  P_B5,
  P_B6,
  P_B7,
  P_C0 = 8,
  P_C1,
  P_C2,
  P_C3,
  P_C4,
  P_C5,
  P_C6,
  P_C7,
  P_D0 = 16,
  P_D1,
  P_D2,
  P_D3,
  P_D4,
  P_D5,
  P_D6,
  P_D7,
  P_E0 = 24,
  P_E1,
  P_E2,
  P_E3,
  P_E4,
  P_E5,
  P_E6,
  P_E7,
  P_F0 = 32,
  P_F1,
  P_F2,
  P_F3,
  P_F4,
  P_F5,
  P_F6,
  P_F7,
};
#endif

#ifdef TARGET_MCU_RP2040
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

void dio_setOutput(uint8_t pin);
void dio_setInput(uint8_t pin);
void dio_setInputPullup(uint8_t pin);
void dio_write(uint8_t pin, bool val);
bool dio_read(uint8_t pin);
void dio_toggle(uint8_t pin);
void dio_setHigh(uint8_t pin);
void dio_setLow(uint8_t pin);

#endif