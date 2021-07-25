#pragma once

#include "km0/types.h"

void halfDuplexSerial_initialize();
void halfDuplexSerial_reSyncSerial();
uint8_t halfDuplexSerial_readData(uint8_t addr);
void halfDuplexSerial_writeData(uint8_t addr, uint8_t data);