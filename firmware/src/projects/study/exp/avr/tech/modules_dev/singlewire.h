#pragma once

#include <stdint.h>

void singleWire_initialize();
void signleWire_setReceiverCallack(void (*proc)(uint8_t *bytes, uint8_t len));
void singleWire_sendBytes(uint8_t *bytes, uint8_t len);
void singleWire_processUpdate();
