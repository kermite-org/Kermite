#ifndef __DEBUG_UART_H__
#define __DEBUG_UART_H__

#include "km0/types.h"

void debugUart_initialize(uint32_t baud);
void debugUart_disable();

#endif
