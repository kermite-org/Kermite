#include "km0/device/system.h"
#include "pico_sdk/src/common/include/pico/stdlib.h"

void delayMs(uint16_t ms) {
  sleep_ms(ms);
}

void delayUs(uint16_t us) {
  sleep_us(us);
}

void system_enableInterrupts() {
}

void system_disableInterrupts() {
}

void system_initializeUserProgram() {
}

void system_jumpToDfuBootloader() {}