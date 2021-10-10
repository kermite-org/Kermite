#include "km0/device/system.h"
#include "pico_sdk/src/common/include/pico/stdlib.h"
#include "pico_sdk/src/rp2_common/include/pico/bootrom.h"

void delayMs(uint16_t ms) {
  sleep_ms(ms);
}

void delayUs(uint16_t us) {
  // sleep_us(us);  //cannot invoke in irq handler
  busy_wait_us_32(us);
}

uint32_t system_getSystemTimeMs() {
  absolute_time_t tt = get_absolute_time();
  return to_ms_since_boot(tt);
}

void system_enableInterrupts() {
}

void system_disableInterrupts() {
}

void system_initializeUserProgram() {
}

void system_jumpToDfuBootloader() {
  reset_usb_boot(0, 0);
}

void system_setupFallbackStdout() {}