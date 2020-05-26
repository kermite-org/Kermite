#include "debug_uart.h"
#include "easyTimer.h"
#include "pio.h"
#include <avr/io.h>
#include <stdio.h>
#include <util/delay.h>

//---------------------------------------------
//env

#define pin_LED0 P_F4
#define pin_LED1 P_F5

static void initBoardIo() {
  pio_setOutput(pin_LED0);
  pio_setOutput(pin_LED1);
}

static void toggleLED0() {
  pio_toggleOutput(pin_LED0);
}

static void outputLED1(bool val) {
  pio_output(pin_LED1, val);
}

//---------------------------------------------

#define pin_TimingDebug P_B2

void onTimer() {
  //toggleLED0();
  pio_toggleOutput(pin_TimingDebug);
}

void start() {
  initDebugUART(38400);
  printf("start\n");
  initBoardIo();

  pio_setOutput(pin_TimingDebug);

  easyTimer_setInterval(onTimer, 4000);

  while (1) {
    toggleLED0();
    _delay_ms(100);
  }
}

int main() {
  USBCON = 0;
  start();
  return 0;
}
