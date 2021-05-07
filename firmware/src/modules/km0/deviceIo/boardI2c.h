#ifndef __BOARD_I2C_H__
#define __BOARD_I2C_H__
#include "km0/types.h"

void boardI2c_initialize();

//slaveAddress: I2Cスレーブのアドレス, 7ビットで指定
void boardI2c_write(uint8_t slaveAddress, uint8_t *buf, int len);
void boardI2c_read(uint8_t slaveAddress, uint8_t *buf, int len);

#endif
