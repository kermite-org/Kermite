#include "hardware/i2c.h"
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/dio.h"
#include "km0/deviceIo/system.h"
#include "pico/stdlib.h"

//board RPi Pico
//GP25: onboard LED
//GP2 I2C1_SDA <--> OLED SDA
//GP3 I2C2_SCL ---> OLED SCL

//----------------------------------------------------------------------

static struct i2c_inst *i2c_instance = i2c1;
static const uint8_t pin_sda = 2;
static const uint8_t pin_scl = 3;

static uint8_t i2c_slave_address = 0;

void __i2c_initialize(uint32_t freqInHz, uint8_t slaveAddress) {
  i2c_init(i2c_instance, freqInHz);
  gpio_set_function(pin_sda, GPIO_FUNC_I2C);
  gpio_set_function(pin_scl, GPIO_FUNC_I2C);
  gpio_pull_up(pin_sda);
  gpio_pull_up(pin_scl);
  i2c_slave_address = slaveAddress;
}

void __i2c_write(uint8_t *buf, int len) {
  i2c_write_blocking(i2c_instance, i2c_slave_address, buf, len, false);
}

//----------------------------------------------------------------------

#define SHOW_FULL_DOTS

static uint8_t commandInitializationBytes[] = {
  0x00,       //Control Byte
  0xAE,       //Display Off
  0x8D, 0x14, //Enable charge pump regulator
#ifdef SHOW_FULL_DOTS
  0xA5, //Entire Display On
#else
  0xA4, //Disable Entire Display On
#endif
  0xAF //Display On
};

void initLcd() {
  __i2c_initialize(400000, 0x3C);
  __i2c_write(commandInitializationBytes, sizeof(commandInitializationBytes));
}

void main() {
  boardIo_setupLeds_rpiPico();
  initLcd();
  while (1) {
    boardIo_toggleLed1();
    delayMs(1000);
  }
}