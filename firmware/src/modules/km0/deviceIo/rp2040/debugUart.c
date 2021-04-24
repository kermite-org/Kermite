#include "km0/deviceIo/debugUart.h"
#include "pico_sdk/src/rp2_common/include/pico/stdio_uart.h"

void debugUart_setup(uint32_t baud) {
  stdio_uart_init_full(uart0, baud, 0, -1);
}

void debugUart_disable() {
}