#include <avr/io.h>
#include <stdio.h>
#include <util/delay.h>

#include "debug_uart.h"
#include "dio.h"

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

  dio_setOutput(P_F4);
  dio_setOutput(P_F5);
  dio_setInputPullup(P_B6);

  while (1) {
    dio_write(P_F4, true);
    _delay_ms(100);
    dio_write(P_F4, false);
    _delay_ms(100);
    bool isPressed = dio_read(P_B6) == 0;
    dio_write(P_F5, isPressed);
  }
}

int main() {
  USBCON = 0;
  //blink0();
  //uartTest();
  blink1();

  return 0;
}
