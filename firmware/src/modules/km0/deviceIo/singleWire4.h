#ifndef __SINGLE_WIRE_4_H__
#define __SINGLE_WIRE_4_H__

#include "km0/types.h"

void singleWire_initialize();

void singleWire_writeTxFrame(uint8_t *buf, uint8_t len);
uint8_t singleWire_readRxFrame(uint8_t *buf, uint8_t maxLen);
void singleWire_exchangeFramesBlocking();

void boardSync_setupSlaveReceiver(void (*f)(void));
void boardSync_clearSlaveReceiver();

#endif