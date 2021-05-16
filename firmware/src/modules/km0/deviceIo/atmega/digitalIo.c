#include "km0/common/bitOperations.h"
#include "km0/deviceIo/digitalIo.h"
#include <avr/io.h>

#define portIndex(p) ((p) >> 3)
#define portBit(p) ((p)&0x07)

#define regPINX(p) (&_SFR_IO8(0x03 + 3 * portIndex(p)))
#define regDDRX(p) (&_SFR_IO8(0x04 + 3 * portIndex(p)))
#define regPORTX(p) (&_SFR_IO8(0x05 + 3 * portIndex(p)))

void digitalIo_setOutput(uint8_t p) {
  bit_on(*regDDRX(p), portBit(p));
}

void digitalIo_setInput(uint8_t p) {
  bit_off(*regDDRX(p), portBit(p));
}

void digitalIo_setInputPullup(uint8_t p) {
  bit_off(*regDDRX(p), portBit(p));
  bit_on(*regPORTX(p), portBit(p));
}

void digitalIo_write(uint8_t p, bool val) {
  bit_spec(*regPORTX(p), portBit(p), val);
}

bool digitalIo_read(uint8_t p) {
  return bit_read(*regPINX(p), portBit(p));
}

void digitalIo_toggle(uint8_t p) {
  bit_invert(*regPORTX(p), portBit(p));
}

volatile uint8_t *digitalIo_ex_getRegPORTX(uint8_t p) {
  return regPORTX(p);
}

volatile uint8_t *digitalIo_ex_getRegPINX(uint8_t p) {
  return regPINX(p);
}

uint8_t digitalIo_ex_getPortBit(uint8_t p) {
  return portBit(p);
}

void digitalIo_setHigh(uint8_t p) {
  digitalIo_write(p, 1);
}

void digitalIo_setLow(uint8_t p) {
  digitalIo_write(p, 0);
}

void digitalIo_toggle_2(uint8_t p) {
  bit_on(*regPINX(p), portBit(p));
}
