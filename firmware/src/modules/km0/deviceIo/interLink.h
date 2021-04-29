#ifndef __INTER_LINK_H__
#define __INTER_LINK_H__

#include "km0/types.h"

void interLink_initialize();

void interLink_writeTxBuffer(uint8_t *buf, uint8_t len);
uint8_t interLink_readRxBuffer(uint8_t *buf, uint8_t maxLen);
void interLink_exchangeFramesBlocking(); //送信+受信

void interLink_setupSlaveReceiver(void (*f)(void));
void interLink_clearSlaveReceiver();

#endif