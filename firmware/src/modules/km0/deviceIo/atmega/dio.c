#include "km0/deviceIo/dio.h"
#include "km0/common/bitOperations.h"
#include <avr/io.h>

#define portIndex(p) ((p) >> 3)
#define portBit(p) ((p)&0x07)

#define regPINX(p) (&_SFR_IO8(0x03 + 3 * portIndex(p)))
#define regDDRX(p) (&_SFR_IO8(0x04 + 3 * portIndex(p)))
#define regPORTX(p) (&_SFR_IO8(0x05 + 3 * portIndex(p)))

void dio_setOutput(uint8_t p) {
  bit_on(*regDDRX(p), portBit(p));
}

void dio_setInput(uint8_t p) {
  bit_off(*regDDRX(p), portBit(p));
}

void dio_setInputPullup(uint8_t p) {
  bit_off(*regDDRX(p), portBit(p));
  bit_on(*regPORTX(p), portBit(p));
}

void dio_write(uint8_t p, bool val) {
  bit_spec(*regPORTX(p), portBit(p), val);
}

bool dio_read(uint8_t p) {
  return bit_read(*regPINX(p), portBit(p));
}

void dio_toggle(uint8_t p) {
  bit_invert(*regPORTX(p), portBit(p));
}

volatile uint8_t *dio_ex_getRegPORTX(uint8_t p) {
  return regPORTX(p);
}

volatile uint8_t *dio_ex_getRegPINX(uint8_t p) {
  return regPINX(p);
}

uint8_t dio_ex_getPortBit(uint8_t p) {
  return portBit(p);
}

void dio_setHigh(uint8_t p) {
  dio_write(p, 1);
}

void dio_setLow(uint8_t p) {
  dio_write(p, 0);
}

void dio_toggle_2(uint8_t p) {
  bit_on(*regPINX(p), portBit(p));
}
