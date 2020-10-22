#include <avr/io.h>
#include <stdio.h>
#include <util/delay.h>

#include "bit_operations.h"
#include "debug_uart.h"
#include "eeprom.h"
#include "pio.h"

static void initLED0() {
  pio_setOutput(P_B0);
}

static void toggleLED0() {
  pio_toggleOutput(P_B0);
}

void debugShowBytes(char *name, uint8_t *buf, int len) {
  printf("%s:", name);
  for (int i = 0; i < len; i++) {
    printf("%02x ", buf[i]);
  }
  printf("\n");
}

void eepromDev() {
  initDebugUART(38400);
  printf("start\n");

  uint16_t addr = 40;
  uint8_t buf[4] = { 10, 20, 30, 44 };

#if 1
  debugShowBytes("write", buf, 4);
  xf_eeprom_write_block(addr, buf, 4);
#endif

  for (int i = 0; i < 4; i++) {
    buf[i] = 0;
  }
  debugShowBytes("cleard", buf, 4);

  xf_eeprom_read_block(addr, buf, 4);

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
