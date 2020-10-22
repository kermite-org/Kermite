#include "pio.h"

#include "bitOperations.h"
#include <avr/io.h>

#define portIndex(p) ((p) >> 3)
#define portBit(p) ((p)&0x07)

#define regPINX(p) (&_SFR_IO8(0x03 + 3 * portIndex(p)))
#define regDDRX(p) (&_SFR_IO8(0x04 + 3 * portIndex(p)))
#define regPORTX(p) (&_SFR_IO8(0x05 + 3 * portIndex(p)))

void pio_setOutput(uint8_t p) {
  bit_on(*regDDRX(p), portBit(p));
}

void pio_setInput(uint8_t p) {
  bit_off(*regDDRX(p), portBit(p));
}

void pio_setInputPullup(uint8_t p) {
  bit_off(*regDDRX(p), portBit(p));
  bit_on(*regPORTX(p), portBit(p));
}

void pio_output(uint8_t p, bool val) {
  bit_spec(*regPORTX(p), portBit(p), val);
}

bool pio_input(uint8_t p) {
  return bit_read(*regPINX(p), portBit(p));
}

void pio_toggleOutput(uint8_t p) {
  bit_invert(*regPORTX(p), portBit(p));
}

volatile uint8_t *pio_ex_getRegPORTX(uint8_t p) {
  return regPORTX(p);
}

volatile uint8_t *pio_ex_getRegPINX(uint8_t p) {
  return regPINX(p);
}

uint8_t pio_ex_getPortBit(uint8_t p) {
  return portBit(p);
}

void pio_setHigh(uint8_t p) {
  pio_output(p, 1);
}

void pio_setLow(uint8_t p) {
  pio_output(p, 0);
}

void pio_toggleOutput_2(uint8_t p) {
  bit_on(*regPINX(p), portBit(p));
}
