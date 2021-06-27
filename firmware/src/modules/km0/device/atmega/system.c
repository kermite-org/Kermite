#include "km0/device/system.h"
#include <avr/interrupt.h>
#include <avr/pgmspace.h>
#include <avr/wdt.h>
#include <stdio.h>
#include <util/delay.h>

void delayMs(uint16_t ms) {
  for (uint16_t i = 0; i < ms; i++) {
    _delay_ms(1);
  }
}

void delayUs(uint16_t us) {
  for (uint16_t i = 0; i < us; i++) {
    _delay_us(1);
  }
}

void system_enableInterrupts() {
  sei();
}

void system_disableInterrupts() {
  cli();
}

void system_initializeUserProgram() {
  //disable watchdog timer
  wdt_reset();
  MCUSR = 0;
  WDTCSR |= _BV(WDCE) | _BV(WDE);
  WDTCSR = 0;

  //disable jtag (use PF4~PF7 as general ports)
  MCUCR = 0x80;
  MCUCR = 0x80;

  //deinit USB
  USBCON = 0;
}

void system_jumpToDfuBootloader() {
  system_disableInterrupts();
  asm volatile("jmp 0x7000");
}

static void putCharDummy() {}

void system_setupFallbackStdout() {
  static FILE mystdout = FDEV_SETUP_STREAM((void *)putCharDummy, NULL, _FDEV_SETUP_WRITE);
  stdout = &mystdout;
}