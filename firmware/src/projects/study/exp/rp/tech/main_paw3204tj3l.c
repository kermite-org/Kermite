
#include "km0/base/bitOperations.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include "pico_sdk/src/rp2_common/include/hardware/gpio.h"
#include <stdio.h>

//board RPi Pico
//GP4 ---> PAW3204 SCLK ---> LA.ch1
//GP5 <--> PAW3204 SDIO ---> LA.ch2
//GP6 debug timing monitor ---> LA.ch0

const int pin_sclk = GP4;
const int pin_sdio = GP5;

const int pin_debug = GP6;

void initPorts() {
  digitalIo_setOutput(pin_sclk);
  digitalIo_write(pin_sclk, 1);

  //configure sdio as pseudo open drain
  gpio_init(pin_sdio);
  gpio_pull_up(pin_sdio);
  gpio_set_dir(pin_sdio, 0);

  digitalIo_setOutput(pin_debug);
  digitalIo_setHigh(pin_debug);
}

void clockHigh() {
  digitalIo_setHigh(pin_sclk);
  // digitalIo_write(pin_sclk, 1);
}

void clockLow() {
  digitalIo_setLow(pin_sclk);
  // digitalIo_write(pin_sclk, 0);
}

void signalOut(bool value) {
  gpio_set_dir(pin_sdio, !value); //drive low for 0, hi-z for 1
}

void signalHigh() {
  gpio_set_dir(pin_sdio, 0); //sdio hi-z
}

void signalLow() {
  gpio_set_dir(pin_sdio, 1); //sdio drive low
}

bool signalRead() {
  digitalIo_read(pin_sdio);
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
  delayMs(2); //T_SIWTT, 1.7ms for normal mode
  // delayMs(400); //T_SIWTT, 320ms(+-20%) for sleep2 mode
}

void writeByte(uint8_t byte) {
  for (int i = 7; i >= 0; i--) {
    uint8_t bit = bit_read(byte, i);
    clockLow();
    signalOut(bit);
    delayUs(5);
    clockHigh();
    delayUs(5);
  }
}

uint8_t readByte() {
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

uint8_t readData(uint8_t addr) {
  writeByte(addr);
  signalHigh();
  delayUs(3); //T_HOLD
  return readByte();
}

void writeData(uint8_t addr, uint8_t data) {
  addr |= 0x80;
  writeByte(addr);
  writeByte(data);
}

int main() {
  debugUart_initialize(38400);
  boardIo_setupLeds_rpiPico();
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
    uint8_t res1 = readData(0x01); //Product_ID2
    uint8_t res2 = readData(0x02); //Motion_Status
    int8_t res3 = readData(0x03);  //Delta_X
    int8_t res4 = readData(0x04);  //Delta_Y

    if (cnt % 10 == 0) {
      // printf("res0=%x\n", res0);
      printf("%x %x %x %d %d\n", res0, res1, res2, res3, res4);
    }
    cnt++;
    debugHigh();
  }
}
