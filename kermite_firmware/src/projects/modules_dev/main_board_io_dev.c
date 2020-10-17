#include <avr/io.h>
#include <stdio.h>
#include <util/delay.h>

#include "debug_uart.h"
#include "pio.h"

void blink0() {
  //blink led on PF4
  DDRF = 0b00010000;
  while (1) {
    PORTF = 0b00010000;
    _delay_ms(100);
    PORTF = 0b00000000;
    _delay_ms(100);
  }
}

void uartTest() {
  initDebugUART(38400);
  printf("start\n");
  int cnt = 0;
  while (1) {
    printf("hello %d\n", cnt++);
    _delay_ms(1000);
  }
}

void blink1() {
  initDebugUART(38400);
  printf("start\n");

  pio_setOutput(P_F4);
  pio_setOutput(P_F5);
  pio_setInputPullup(P_B6);

  while (1) {
    pio_output(P_F4, true);
    _delay_ms(100);
    pio_output(P_F4, false);
    _delay_ms(100);
    bool isPressed = pio_input(P_B6) == 0;
    pio_output(P_F5, isPressed);
  }
}

int main() {
  USBCON = 0;
  //blink0();
  //uartTest();
  blink1();

  return 0;
}
