#include "km0/device/system.h"
#include <avr/interrupt.h>
#include <avr/pgmspace.h>
#include <avr/wdt.h>
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
  USBCON = 0;
  //disable watchdog timer
  wdt_reset();
  MCUSR = 0;
  WDTCSR |= _BV(WDCE) | _BV(WDE);
  WDTCSR = 0;
}