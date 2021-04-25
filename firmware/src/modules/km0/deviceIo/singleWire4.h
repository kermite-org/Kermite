#ifndef __SINGLE_WIRE_4_H__
#define __SINGLE_WIRE_4_H__

#include "km0/types.h"

void singleWire_initialize();

void singleWire_startSynchronizedSection();
void singleWire_endSynchronizedSection();
void singleWire_transmitFrameBlocking(uint8_t *buf, uint8_t len);
uint8_t singleWire_receiveFrameBlocking(uint8_t *buf, uint8_t maxLen);
void singleWire_setInterruptedReceiver(void (*f)(void));
void singleWire_clearInterruptedReceiver();

#endif