#include "km0/base/bitOperations.h"
#include "km0/device/boardIo.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include <avr/interrupt.h>
#include <avr/io.h>
#include <stdio.h>

ISR(TIMER3_COMPA_vect) {
  digitalIo_toggle(P_F4);
}

int main() {
  system_initializeUserProgram();
  boardIo_setupLeds_proMicroAvr();

  digitalIo_setOutput(P_F4);

  //CTC動作, 分周なし, 比較一致A割り込み
  TCCR3A = 0;
  TCCR3B = _BV(WGM32) | _BV(CS30);
  TIMSK3 = _BV(OCIE3A);
  OCR3A = 16000;
  TCNT3 = 0;

  sei();

  while (1) {
    boardIo_toggleLed2();
    delayMs(500);
  }
  return 0;
}