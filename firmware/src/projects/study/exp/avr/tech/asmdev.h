#pragma once

#include <stdint.h>

int8_t sum(int8_t a, int8_t b);

void foo0();
void foo1();

void emitNeoPixelByte(uint8_t val);

//void emitByteOne(uint8_t val, uint8_t isLastByte);
//uint8_t receiveByteOne();

uint8_t sumArrayA(uint8_t *buf, uint8_t len);
