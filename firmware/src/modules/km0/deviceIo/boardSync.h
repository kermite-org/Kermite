#ifndef __BOARD_SYNC_H__
#define __BOARD_SYNC_H__

#include "km0/types.h"

void boardSync_initialize();

void boardSync_writeTxFrame(uint8_t *buf, uint8_t len);
uint8_t boardSync_readRxFrame(uint8_t *buf, uint8_t maxLen);
void boardSync_exchangeFramesBlocking();

void boardSync_setupSlaveReceiver(void (*f)(void));
void boardSync_clearSlaveReceiver();

#endif