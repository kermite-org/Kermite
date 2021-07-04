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

static volatile uint32_t systemTimeMs = 0;

ISR(TIMER3_COMPA_vect) {
  systemTimeMs++;
}

static void setupMsTimer() {
  //CTC mode, no prescaler, compare A match interrupt
  TCCR3A = 0;
  TCCR3B = _BV(WGM32) | _BV(CS30);
  TIMSK3 = _BV(OCIE3A);
  OCR3A = 16000;
  TCNT3 = 0;
}

uint32_t system_getSystemTimeMs() {
  return systemTimeMs;
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

  setupMsTimer();
}

void system_jumpToDfuBootloader() {
  printf("reset to dfu bootloader");
  _delay_ms(100);
  //https://www.pjrc.com/teensy/jump_to_bootloader.html
  cli();
  UDCON = 1;
  USBCON = (1 << FRZCLK);
  UCSR1B = 0;
  _delay_ms(5);
  EIMSK = 0;
  PCICR = 0;
  SPCR = 0;
  ACSR = 0;
  EECR = 0;
  ADCSRA = 0;
  TIMSK0 = 0;
  TIMSK1 = 0;
  TIMSK3 = 0;
  TIMSK4 = 0;
  UCSR1B = 0;
  TWCR = 0;
  DDRB = 0;
  DDRC = 0;
  DDRD = 0;
  DDRE = 0;
  DDRF = 0;
  TWCR = 0;
  PORTB = 0;
  PORTC = 0;
  PORTD = 0;
  PORTE = 0;
  PORTF = 0;
  asm volatile("jmp 0x7000");
  while (1) {}
}

static void putCharDummy() {}

void system_setupFallbackStdout() {
  static FILE mystdout = FDEV_SETUP_STREAM((void *)putCharDummy, NULL, _FDEV_SETUP_WRITE);
  stdout = &mystdout;
}