
#include "km0/base/bitOperations.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include <avr/io.h>
#include <stdio.h>

//board Pro Micro
//PD4 ---(level convertion)--> PAW3204 SCLK ---> LA.ch1
//PC0 ,with external pullup <--(level convertion)--> PAW3204 SDIO ---> LA.ch2
//PF4 debug timing monitor ---> LA.ch0

const int pin_clock = P_D4;
const int pin_data = P_C6;

const int pin_debug = P_F4;

#define portIndex(p) ((p) >> 3)
#define portBit(p) ((p)&0x07)

#define regPINX(p) (&_SFR_IO8(0x03 + 3 * portIndex(p)))
#define regDDRX(p) (&_SFR_IO8(0x04 + 3 * portIndex(p)))
#define regPORTX(p) (&_SFR_IO8(0x05 + 3 * portIndex(p)))

void digitalIo_pseudoOpenDrain_init(uint8_t p) {
  bit_off(*regDDRX(p), portBit(p));  //DDR=0, input
  bit_off(*regPORTX(p), portBit(p)); //PORT=0
}

// void digitalIo_pseudoOpenDrain_HiImpedance(uint8_t p) {
//   bit_off(*regDDRX(p), portBit(p)); //DDR=0, hi-z
// }

// void digitalIo_pseudoOpenDrain_DriveLow(uint8_t p) {
//   bit_on(*regDDRX(p), portBit(p)); //DDR=1, drive low
// }

void digitalIo_pseudoOpenDrain_output(uint8_t p, bool value) {
  bit_spec(*regDDRX(p), portBit(p), !value); //drive low for 0, hi-z for 1
}

void initPorts() {
  digitalIo_setOutput(pin_clock);
  digitalIo_setHigh(pin_clock);

  digitalIo_pseudoOpenDrain_init(pin_data);

  digitalIo_setOutput(pin_debug);
  digitalIo_setHigh(pin_debug);
}

void clockHigh() {
  digitalIo_setHigh(pin_clock);
}

void clockLow() {
  digitalIo_setLow(pin_clock);
}

void signalHiZ() {
  digitalIo_pseudoOpenDrain_output(pin_data, 1);
}

void signalOut(bool value) {
  digitalIo_pseudoOpenDrain_output(pin_data, value);
}

bool signalRead() {
  return digitalIo_read(pin_data);
}

void debugLow() {
  digitalIo_setLow(pin_debug);
}

void debugHigh() {
  digitalIo_setHigh(pin_debug);
}

void reSyncSerial() {
  clockLow();
  delayUs(1); //T_RESYNC
  clockHigh();
  delayMs(1); //T_SIWTT, 1.7ms for normal mode
  // delayMs(400); //T_SIWTT, 320ms(+-20%) for sleep2 mode
}

void writeByte(uint8_t byte) {
  for (int i = 7; i >= 0; i--) {
    uint8_t bit = bit_read(byte, i);
    clockLow();
    signalOut(bit);
    delayUs(1);
    clockHigh();
    delayUs(1);
  }
}

uint8_t readByte() {
  uint8_t data = 0;
  for (int i = 7; i >= 0; i--) {
    clockLow();
    delayUs(1);
    clockHigh();
    uint8_t bit = signalRead();
    delayUs(1);
    bit_spec(data, i, bit);
  }
  return data;
}

uint8_t readData(uint8_t addr) {
  writeByte(addr);
  signalHiZ();
  delayUs(3); //T_HOLD
  // delayUs(30);
  debugHigh();
  return readByte();
}

void writeData(uint8_t addr, uint8_t data) {
  addr |= 0x80;
  writeByte(addr);
  writeByte(data);
}

int main() {
  debugUart_initialize(38400);
  boardIo_setupLeds_proMicroAvr();
  initPorts();
  reSyncSerial();

  uint32_t cnt = 0;
  while (true) {
    if (cnt % 100 == 0) {
      boardIo_toggleLed1();
    }

    delayMs(10);
    debugLow();
    uint8_t res0 = readData(0x00); //Product_ID1
    // uint8_t res1 = readData(0x01); //Product_ID2
    // uint8_t res2 = readData(0x02); //Motion_Status
    // int8_t res3 = readData(0x03);  //Delta_X
    // int8_t res4 = readData(0x04);  //Delta_Y

    if (cnt % 10 == 0) {
      printf("res= %x \n", res0);
      // printf("%x %x %x %d %d\n", res0, res1, res2, res3, res4);
    }
    cnt++;
    debugHigh();
  }
}
