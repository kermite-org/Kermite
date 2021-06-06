#include "asmdev.h"
#include "km0/base/bitOperations.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/serialLed.h"
#include "km0/device/system.h"
#include <avr/interrupt.h>
#include <avr/io.h>
#include <stdio.h>
#include <util/delay.h>

//---------------------------------------------
//timing debug pin

static const int pin_debug = P_F5;

static void debug_initTimeDebugPin() {
  digitalIo_setOutput(pin_debug);
  digitalIo_setHigh(pin_debug);
}

static void debug_timingPinLow() {
  digitalIo_setLow(pin_debug);
}

static void debug_timingPinHigh() {
  digitalIo_setHigh(pin_debug);
}

//---------------------------------------------

uint8_t tick = 0;

void emitDev() {
  // cli();
  debug_timingPinLow();
  uint8_t rr = tick;
  uint8_t gg = 0;
  uint8_t bb = 255 - tick;
  uint32_t col = ((uint32_t)rr) << 16 | ((uint32_t)gg) << 8 | bb;
  for (int i = 0; i < 7; i++) {
    serialLed_putPixel(col);
    serialLed_putPixel(0x204020);
  }
  debug_timingPinHigh();
  // sei();
  tick++;
}

int main() {
  USBCON = 0;
  debugUart_initialize(38400);
  boardIo_setupLeds_proMicroAvr();
  printf("start\n");
  serialLed_initialize();
  debug_initTimeDebugPin();

  uint32_t cnt = 0;
  while (1) {
    if (cnt % 100 == 0) {
      boardIo_toggleLed1();
    }
    emitDev();
    delayMs(10);
    cnt++;
  }

  return 0;
}