#include "system.h"
#include "pico/stdlib.h"

void delayMs(uint16_t ms) {
  sleep_ms(ms);
}

void delayUs(uint16_t us) {
  sleep_us(us);
}

uint8_t system_readRomByte(const uint8_t *ptr) {
  return *ptr;
}

uint16_t system_readRomWord(const uint16_t *ptr) {
  return *ptr;
}

void system_enableInterrupts() {
}

void system_disableInterrupts() {
}

void system_initializeUserProgram() {
}