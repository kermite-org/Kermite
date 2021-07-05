#pragma once

#include "km0/types.h"

void singleWire_initialize_txonly(); //for debug
void singleWire_initialize();
void singleWire_registerReceiveBuffer(uint8_t *buffer, uint8_t capacity);
void singleWire_sendBytes(uint8_t *bytes, uint8_t len);
uint8_t singleWire_peekReceivedCount();
