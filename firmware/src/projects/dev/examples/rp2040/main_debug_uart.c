#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/digitalIo.h"
#include "km0/deviceIo/system.h"
#include <stdio.h>

//board RPi Pico
//GP25: onboard LED
//GP0 ----> USB UART ---> PC

int main() {
  debugUart_initialize(38400);
  digitalIo_setOutput(GP25);
  printf("start\n");

  uint32_t cnt = 0;
  while (true) {
    printf("cnt = %d\n", ++cnt);
    digitalIo_toggle(GP25);
    delayMs(1000);
  }
}
