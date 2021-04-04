#include "system.h"
#include <avr/interrupt.h>
#include <avr/pgmspace.h>
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

uint8_t system_readRomByte(const uint8_t *ptr) {
  return pgm_read_byte(ptr);
}

uint16_t system_readRomWord(const uint16_t *ptr) {
  return pgm_read_word(ptr);
}

void system_enableInterrupts() {
  sei();
}

void system_disableInterrupts() {
  cli();
}

void system_initializeUserProgram() {
  USBCON = 0;
}