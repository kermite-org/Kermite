#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/digitalIo.h"
#include "km0/deviceIo/system.h"
#include <stdio.h>

//board ProMicro
//B0: onboard LED
//D3 (TX) ---> USB UART ---> PC

void uartTest() {
  digitalIo_setOutput(P_B0);
  debugUart_initialize(38400);
  printf("start\n");
  int cnt = 0;
  while (1) {
    printf("hello %d\n", cnt++);
    digitalIo_toggle(P_B0);
    delayMs(1000);
  }
}

int main() {
  system_initializeUserProgram();
  uartTest();
  return 0;
}