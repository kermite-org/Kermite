#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/dio.h"
#include "pico_sdk/src/rp2_common/include/pico/stdio_uart.h"
#if __has_include("config.h")
#include "config.h"
#endif

#ifndef KM0_RP_DEBUG_UART__UART_INSTANCE
#define KM0_RP_DEBUG_UART__UART_INSTANCE uart0
#endif

#ifndef KM0_RP_DEBUG_UART__PIN_TX
#define KM0_RP_DEBUG_UART__PIN_TX GP0
#endif

static uart_inst_t *const uart_instance = KM0_RP_DEBUG_UART__UART_INSTANCE;
static const int pin_tx = KM0_RP_DEBUG_UART__PIN_TX;

void debugUart_setup(uint32_t baud) {
  stdio_uart_init_full(uart_instance, baud, pin_tx, -1);
}

void debugUart_disable() {
}