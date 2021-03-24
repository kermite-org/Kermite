#include "debugUart.h"
#include "dio.h"
#include "system.h"
#include <stdio.h>

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
