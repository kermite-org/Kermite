#include "km0/base/bitOperations.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include <avr/interrupt.h>
#include <avr/io.h>
#include <stdio.h>

//board ProMicro

static const int delta_none = 2;
static const int delta_dec = 0;
static const int delta_inc = 1;

static const int pinA = P_B2;
static const int pinB = P_B3;

int prev_a = 0;

static void updateEncoderInterrupt() {
  int a = digitalIo_read(pinA);
  int b = digitalIo_read(pinB);
  int delta = delta_none;
  if (!prev_a && a) {
    delta = (b == 0) ? delta_inc : delta_dec;
  }
  if (prev_a && !a) {
    delta = (b == 1) ? delta_inc : delta_dec;
  }
  prev_a = a;
  if (delta != delta_none) {
    // printf("%d\n", delta);
  }
}

static void initEncoder() {
  digitalIo_setInputPullup(pinA);
  digitalIo_setInputPullup(pinB);
  uint8_t portBit = pinA & 7;
  PCMSK0 = 1 << portBit;
  PCICR |= _BV(PCIE0);
}

ISR(PCINT0_vect) {
  updateEncoderInterrupt();
}

void start() {
  debugUart_initialize(38400);
  boardIo_setupLeds_proMicroAvr();
  initEncoder();
  printf("start\n");
  sei();
  while (1) {
    boardIo_toggleLed1();
    delayMs(500);
  }
}

int main() {
  system_initializeUserProgram();
  start();
  return 0;
}
