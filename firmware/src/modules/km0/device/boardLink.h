#ifndef __BOARD_LINK_H__
#define __BOARD_LINK_H__

#include "km0/types.h"

void boardLink_initialize();

void boardLink_writeTxBuffer(uint8_t *buf, uint8_t len);
uint8_t boardLink_readRxBuffer(uint8_t *buf, uint8_t maxLen);
void boardLink_exchangeFramesBlocking(); //送信+受信

void boardLink_setupSlaveReceiver(void (*f)(void));
void boardLink_clearSlaveReceiver();

#endif