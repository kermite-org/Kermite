#ifndef __SINGLEWIRE3_H__
#define __SINGLEWIRE3_H__

#include "types.h"

void singlewire_sendFrame(uint8_t *txbuf, uint8_t len);
uint8_t singlewire_receiveFrame(uint8_t *rxbuf, uint8_t capacity);

void singlewire_initialize();
void singlewire_setupInterruptedReceiver(void (*pReceiverCallback)(void));

#endif
