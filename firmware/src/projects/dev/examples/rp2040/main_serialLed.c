#include "dio.h"
#include "serialLed.h"
#include "system.h"

//board RPi Pico
//GP17 ---> NeoPixel Strip 8LEDs

uint32_t colors[] = { 0xFF0000, 0x00FF00, 0x0000FF, 0x00FFFF, 0xFF00FF, 0xFFFF00, 0xFFFFFF };

void main() {
  serialLed_initialize(GP17);

  int cnt = 0;
  while (1) {
    uint termMs = 2000;
    float p = (cnt % termMs) / (float)termMs;
    float q = p < 0.5 ? 2 * p : (2 - 2 * p);
    uint32_t alpha = q * 20;
    for (int i = 0; i < 7; i++) {
      uint32_t col = (alpha << 24) | colors[i];
      serialLed_putPixel(col);
    }
    delayMs(1);
    cnt++;
  }
}
