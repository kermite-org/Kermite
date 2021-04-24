#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/dio.h"
#include "km0/deviceIo/system.h"
#include <stdio.h>

//board RPi Pico
//GP25: onboard LED
//GP0 ----> USB UART ---> PC

int main() {
  debugUart_setup(38400);
  dio_setOutput(GP25);
  printf("start\n");

  uint32_t cnt = 0;
  while (true) {
    printf("cnt = %d\n", ++cnt);
    dio_toggle(GP25);
    delayMs(1000);
  }
}
