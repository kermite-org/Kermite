#include "km0/common/bitOperations.h"
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/dio.h"
#include "km0/deviceIo/system.h"
#include <avr/io.h>
#include <stdio.h>
#include <util/twi.h>

//board pro micro
//PD1 I2C1_SDA <--> OLED SDA
//PD0 I2C2_SCL ---> OLED SCL

void __i2c_init() {
  dio_setInputPullup(P_D0);
  dio_setInputPullup(P_D1);
  uint32_t clockFreq = 400000;
  TWSR = 0;
  TWBR = (F_CPU / clockFreq - 16) / 2;
}

void __i2c_write(uint8_t slaveAddress, uint8_t *buf, int len) {
  //emit start condition
  TWCR = _BV(TWINT) | _BV(TWSTA) | _BV(TWEN);
  while (bit_is_off(TWCR, TWINT)) {};

  // uint8_t twst = TWSR & 0xF8;
  // // uint8_t twsr = TWSR;
  // if (twst != TW_START) {
  //   printf("start failed %x\n", twst);
  //   return;
  // }

  //write slave address
  TWDR = (slaveAddress << 1) | 0; //write
  TWCR = _BV(TWINT) | _BV(TWEN);
  while (bit_is_off(TWCR, TWINT)) {};

  // twst = TWSR & 0xF8;
  // if (!(twst == TW_MT_SLA_ACK)) {
  //   printf("sla+w failed %x\n", twst);
  //   return;
  // }

  for (int i = 0; i < len; i++) {
    //write data
    TWDR = buf[i];
    TWCR = _BV(TWINT) | _BV(TWEN);
    while (bit_is_off(TWCR, TWINT)) {};
  }

  //emit stop condition
  TWCR = _BV(TWINT) | _BV(TWSTO) | _BV(TWEN);
}

#define SHOW_FULL_DOTS

static uint8_t lcdInitCommandBytes[] = {
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

void dev() {
  __i2c_write(0x3C, lcdInitCommandBytes, sizeof(lcdInitCommandBytes));
}

int main() {
  debugUart_initialize(38400);
  boardIo_setupLeds(P_B0, P_D5, true);
  printf("start\n");
  __i2c_init();
  dev();

  while (1) {
    boardIo_toggleLed2();
    delayMs(1000);
  }
  return 0;
}