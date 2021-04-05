#include "debugUart.h"
#include "dio.h"
#include "system.h"
#include <avr/io.h>
#include <stdio.h>

//board ProMicro
//B0: onboard LED
//D3 (TX) ---> USB UART ---> PC

void uartTest() {
  dio_setOutput(P_B0);
  debugUart_setup(38400);
  printf("start\n");
  int cnt = 0;
  while (1) {
    printf("hello %d\n", cnt++);
    dio_toggle(P_B0);
    delayMs(1000);
  }
}

int main() {
  USBCON = 0;
  uartTest();
  return 0;
}