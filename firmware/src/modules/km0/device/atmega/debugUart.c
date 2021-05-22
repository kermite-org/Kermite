#include "km0/device/debugUart.h"
#include "km0/base/bitOperations.h"
#include <avr/io.h>
#include <stdio.h>

static void uart_init(uint32_t baud) {
  UBRR1 = (F_CPU / 16 / baud - 1);         //ボーレート設定
  bits_spec(UCSR1C, UCSZ10, 0b111, 0b011); //8ビット
  bits_spec(UCSR1C, UPM10, 0b11, 0b00);    //パリティなし
  bit_off(UCSR1C, USBS1);                  //ストップビット1
  bit_on(UCSR1B, TXEN1);                   //送信有効化
}

static void uart_deinit() {
  bit_off(UCSR1B, TXEN1);
}

static bool debug_uart_enabled = false;

static void uart_putchar(char byte) {
  if (debug_uart_enabled) {
    if (byte == '\n') {
      uart_putchar('\r');
    }
    while (bit_is_off(UCSR1A, UDRE1)) {}
    UDR1 = byte;
  }
}

static FILE mystdout = FDEV_SETUP_STREAM((void *)uart_putchar, NULL, _FDEV_SETUP_WRITE);

void debugUart_initialize(uint32_t baud) {
  uart_init(baud);
  stdout = &mystdout;
  debug_uart_enabled = true;
  printf("--------\n");
}

void debugUart_disable() {
  uart_deinit();
  stdout = &mystdout;
  debug_uart_enabled = false;
}
