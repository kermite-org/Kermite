
#include "km0/base/bitOperations.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include "pico_sdk/src/rp2_common/include/hardware/gpio.h"
#include <stdio.h>

const int pin_sdio = GP4;
const int pin_sclk = GP5;

enum {
  OpticalSensorRegister_ProductId1 = 0x00,
  OpticalSensorRegister_ProductId2 = 0x01,
  OpticalSensorRegister_MotionStatus = 0x02,
  OpticalSensorRegister_DeltaX = 0x03,
  OpticalSensorRegister_DeltaY = 0x04
};

static void initPorts() {
  digitalIo_setOutput(pin_sclk);
  digitalIo_write(pin_sclk, 1);

  //configure sdio as pseudo open drain
  gpio_init(pin_sdio);
  gpio_pull_up(pin_sdio);
  gpio_set_dir(pin_sdio, 0);
}

static void clockHigh() {
  digitalIo_setHigh(pin_sclk);
}

static void clockLow() {
  digitalIo_setLow(pin_sclk);
}

static void signalOut(bool value) {
  gpio_set_dir(pin_sdio, !value); //drive low for 0, hi-z for 1
}

static void signalHigh() {
  gpio_set_dir(pin_sdio, 0); //sdio hi-z
}

static void signalLow() {
  gpio_set_dir(pin_sdio, 1); //sdio drive low
}

static bool signalRead() {
  digitalIo_read(pin_sdio);
}

static void reSyncSerial() {
  clockLow();
  delayUs(1); //T_RESYNC
  clockHigh();
  delayMs(2); //T_SIWTT, 1.7ms for normal mode
  // delayMs(400); //T_SIWTT, 320ms(+-20%) for sleep2 mode
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

static uint8_t readData(uint8_t addr) {
  writeByte(addr);
  signalHigh();
  delayUs(3); //T_HOLD
  return readByte();
}

static void writeData(uint8_t addr, uint8_t data) {
  addr |= 0x80;
  writeByte(addr);
  writeByte(data);
}

void pointingDevice_initialize() {
  initPorts();
  reSyncSerial();
}

void pointingDevice_update(int8_t *outDeltaX, int8_t *outDeltaY) {
  *outDeltaX = readData(OpticalSensorRegister_DeltaX);
  *outDeltaY = readData(OpticalSensorRegister_DeltaY);
}
