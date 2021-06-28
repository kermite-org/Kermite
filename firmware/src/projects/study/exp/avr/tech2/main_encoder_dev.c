#include "km0/base/bitOperations.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include <avr/interrupt.h>
#include <stdio.h>

//board ProMicro
//B2: encoder pin for phase A
//B3: encoder pin for phase B

static const int rot_none = 2;
static const int rot_ccw = 0;
static const int rot_cw = 1;

static const int pinA = P_B2;
static const int pinB = P_B3;

static int prev_a = 0;

static uint32_t rots_buf = 0;
static int rots_num = 0;

static void readEncoderInputOnPinChangeInterrupt() {
  int a = digitalIo_read(pinA);
  int b = digitalIo_read(pinB);
  int delta = rot_none;
  if (!prev_a && a) {
    delta = (b == 0) ? rot_cw : rot_ccw;
  }
  if (prev_a && !a) {
    delta = (b == 1) ? rot_cw : rot_ccw;
  }
  prev_a = a;
  if (delta != rot_none) {
    bit_spec(rots_buf, rots_num, delta);
    rots_num++;
  }
}

static int pullEncoderEventOne() {
  if (rots_num > 0) {
    int rot = rots_buf & 1;
    rots_buf >>= 1;
    rots_num--;
    return rot == rot_cw ? 1 : -1;
  }
  return 0;
}

static void initEncoder() {
  digitalIo_setInputPullup(pinA);
  digitalIo_setInputPullup(pinB);
  uint8_t portBit = pinA & 7;
  PCMSK0 = 1 << portBit;
  PCICR |= _BV(PCIE0);
}

static void processEncoderUpdate() {
  int dir = pullEncoderEventOne();
  if (dir != 0) {
    printf("%d\n", dir);
  }
}

ISR(PCINT0_vect) {
  readEncoderInputOnPinChangeInterrupt();
}

void start() {
  debugUart_initialize(38400);
  boardIo_setupLeds_proMicroAvr();
  initEncoder();
  printf("start\n");
  sei();
  uint32_t tick = 0;
  while (1) {
    if (tick % 1000 == 0) {
      boardIo_toggleLed1();
    }
    if (tick % 5 == 0) {
      processEncoderUpdate();
    }
    delayMs(1);
  }
}

int main() {
  system_initializeUserProgram();
  start();
  return 0;
}
