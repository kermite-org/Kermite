#include "km0/device/debugUart.h"
#include "km0/base/configImport.h"
#include "km0/device/digitalIo.h"
#include "pico_sdk/src/rp2_common/include/pico/stdio_uart.h"
#include "stdio.h"

#ifndef KM0_RP_DEBUG_UART__UART_INSTANCE
#define KM0_RP_DEBUG_UART__UART_INSTANCE uart0
#endif

#ifndef KM0_RP_DEBUG_UART__PIN_TX
#define KM0_RP_DEBUG_UART__PIN_TX GP0
#endif

static uart_inst_t *const uart_instance = KM0_RP_DEBUG_UART__UART_INSTANCE;
static const int pin_tx = KM0_RP_DEBUG_UART__PIN_TX;

void debugUart_initialize(uint32_t baud) {
  stdio_uart_init_full(uart_instance, baud, pin_tx, -1);
  printf("--------\n");
}

void debugUart_disable() {
}