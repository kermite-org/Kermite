#include "km0/deviceIo/digitalIo.h"
#include "km0/deviceIo/system.h"

//board RPi Pico
//GP25: onboard LED

int main() {
  digitalIo_setOutput(GP25);
  while (true) {
    digitalIo_write(GP25, 1);
    delayMs(1000);
    digitalIo_write(GP25, 0);
    delayMs(1000);
  }
}
