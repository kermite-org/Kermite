#include <avr/io.h>
#include <stdio.h>
#include <util/delay.h>

#include "bitOperations.h"
#include "dataMemory.h"
#include "debugUart.h"
#include "dio.h"

static void initLED0() {
  dio_setOutput(P_B0);
}

static void toggleLED0() {
  dio_toggle(P_B0);
}

void debugShowBytes(char *name, uint8_t *buf, int len) {
  printf("%s:", name);
  for (int i = 0; i < len; i++) {
    printf("%02x ", buf[i]);
  }
  printf("\n");
}

void eepromDev() {
  debugUart_setup(38400);
  printf("start\n");

  uint16_t addr = 40;
  uint8_t buf[4] = { 10, 20, 30, 44 };

#if 1
  debugShowBytes("write", buf, 4);
  dataMemory_writeBlock(addr, buf, 4);
#endif

  for (int i = 0; i < 4; i++) {
    buf[i] = 0;
  }
  debugShowBytes("cleard", buf, 4);

  dataMemory_readBlock(addr, buf, 4);

  debugShowBytes("read", buf, 4);

  initLED0();
  while (1) {
    toggleLED0();
    _delay_ms(100);
  }
}

int main() {
  USBCON = 0;
  eepromDev();
  return 0;
}
