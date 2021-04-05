#include "dio.h"
#include <avr/delay.h>
#include <avr/io.h>

//board ProMicro
//B0: onboard RX LED
//D5: onboard TX LED

void blink() {
  dio_setOutput(P_B0);
  dio_setOutput(P_D5);

  while (1) {
    dio_write(P_B0, 1);
    dio_write(P_D5, 1);
    _delay_ms(500);
    dio_write(P_B0, 0);
    dio_write(P_D5, 0);
    _delay_ms(500);
  }
}

int main() {
  USBCON = 0;
  blink();
  return 0;
}
