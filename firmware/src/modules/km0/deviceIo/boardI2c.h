#ifndef __BOARD_I2C_H__
#define __BOARD_I2C_H__
#include "km0/types.h"

void boardI2c_initialize();

//slaveAddress: I2Cスレーブのアドレス, 7ビットで指定
void boardI2c_write(uint8_t slaveAddress, uint8_t *buf, int len);
void boardI2c_read(uint8_t slaveAddress, uint8_t *buf, int len);

//データを1バイトずつ送る実装, AVRでpgm_read_byteでROMから読み取った値を送る場合などに使用
void boardI2c_procedural_startWrite(uint8_t slaveAddress);
void boardI2c_procedural_putByte(uint8_t data);
void boardI2c_procedural_endWrite();

#endif
