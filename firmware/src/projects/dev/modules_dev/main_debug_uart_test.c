#include <avr/io.h>
#include <stdio.h>
#include <util/delay.h>

#include "debug_uart.h"
#include "dio.h"

void uartTest() {
  dio_setOutput(P_B0);
  initDebugUART(38400);
  printf("start\n");
  int cnt = 0;
  while (1) {
    printf("hello %d\n", cnt++);
    dio_toggle(P_B0);
    _delay_ms(1000);
  }
}

int main() {
  USBCON = 0;
  uartTest();

  return 0;
}