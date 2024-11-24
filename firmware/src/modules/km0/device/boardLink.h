#pragma once

#include "km0/types.h"

void boardLink_singleWire_setSignalPin(int8_t pin);
void boardLink_initialize();

//opcode(配列の1バイト目)は0xC0以上の値とする。0xC0未満の値は将来の最適化のために予約
void boardLink_writeTxBuffer(uint8_t *buf, uint8_t len);
uint8_t boardLink_readRxBuffer(uint8_t *buf, uint8_t maxLen);
void boardLink_exchangeFramesBlocking(); //送信+受信

void boardLink_setupSlaveReceiver(void (*f)(void));
void boardLink_clearSlaveReceiver();
