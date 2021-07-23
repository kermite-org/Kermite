#include "halfDuplexSerial.h"
#include "km0/base/bitOperations.h"
#include "km0/base/configImport.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"

#ifndef KM0_HALF_DUPLEX_SERIAL__PIN_SCLK
#error KM0_HALF_DUPLEX_SERIAL__PIN_SCLK is not defined
#endif

#ifndef KM0_HALF_DUPLEX_SERIAL__PIN_SDIO
#error KM0_HALF_DUPLEX_SERIAL__PIN_SDIO is not defined
#endif

static const int pin_sclk = KM0_HALF_DUPLEX_SERIAL__PIN_SCLK;
static const int pin_sdio = KM0_HALF_DUPLEX_SERIAL__PIN_SDIO;

static void clockHigh() {
  digitalIo_setHigh(pin_sclk);
}

static void clockLow() {
  digitalIo_setLow(pin_sclk);
}

static void signalOut(bool value) {
  digitalIo_pseudoOpenDrain_write(pin_sdio, value);
}

void signalHiZ() {
  digitalIo_pseudoOpenDrain_write(pin_sdio, 1);
}

static bool signalRead() {
  return digitalIo_pseudoOpenDrain_read(pin_sdio);
}

static void writeByte(uint8_t byte) {
  for (int i = 7; i >= 0; i--) {
    uint8_t bit = bit_read(byte, i);
    clockLow();
    signalOut(bit);
    delayUs(5);
    clockHigh();
    delayUs(5);
  }
}

static uint8_t readByte() {
  uint8_t data = 0;
  for (int i = 7; i >= 0; i--) {
    clockLow();
    delayUs(5);
    clockHigh();
    uint8_t bit = signalRead();
    delayUs(5);
    bit_spec(data, i, bit);
  }
  return data;
}

void halfDuplexSerial_initialize() {
  digitalIo_setOutput(pin_sclk);
  digitalIo_setHigh(pin_sclk);
  digitalIo_pseudoOpenDrain_init(pin_sdio);
}

void halfDuplexSerial_reSyncSerial() {
  clockLow();
  delayUs(1); //T_RESYNC
  clockHigh();
  delayMs(2); //T_SIWTT, 1.7ms for normal mode
  // delayMs(400); //T_SIWTT, 320ms(+-20%) for sleep2 mode
}

uint8_t halfDuplexSerial_readData(uint8_t addr) {
  writeByte(addr);
  signalHiZ();
  delayUs(3); //T_HOLD
  return readByte();
}

void halfDuplexSerial_writeData(uint8_t addr, uint8_t data) {
  addr |= 0x80;
  writeByte(addr);
  writeByte(data);
}
