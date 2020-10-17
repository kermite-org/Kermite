#ifndef __PIO_H__
#define __PIO_H__

#include "types.h"

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

void pio_setOutput(uint8_t pin);
void pio_setInput(uint8_t pin);
void pio_setInputPullup(uint8_t pin);
void pio_output(uint8_t pin, bool val);
bool pio_input(uint8_t pin);
void pio_toggleOutput(uint8_t pin);

volatile uint8_t *pio_ex_getRegPORTX(uint8_t pin);
volatile uint8_t *pio_ex_getRegPINX(uint8_t pin);
uint8_t pio_ex_getPortBit(uint8_t pin);

void pio_setHigh(uint8_t pin);
void pio_setLow(uint8_t pin);

#endif