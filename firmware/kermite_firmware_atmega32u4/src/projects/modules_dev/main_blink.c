#include "pio.h"
#include <avr/io.h>
#include <stdio.h>
#include <util/delay.h>

//blink LEDs on ProMicro board

void blink() {
  pio_setOutput(P_B0);
  pio_setOutput(P_D5);

  while (1) {
    pio_output(P_B0, 1);
    pio_output(P_D5, 1);
    _delay_ms(500);
    pio_output(P_B0, 0);
    pio_output(P_D5, 0);
    _delay_ms(500);
  }
}

int main() {
  USBCON = 0;
  blink();
  return 0;
}
