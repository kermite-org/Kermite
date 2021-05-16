#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/digitalIo.h"
#include "km0/deviceIo/system.h"

//board ProMicro Pico
//GP25: onboard RGB LED

int main() {
  boardIo_setupLedsRgb(GP25);
  while (true) {
    boardIo_writeLed1(true);
    delayMs(1);
    boardIo_writeLed2(false);
    delayMs(1000);
    boardIo_writeLed1(false);
    delayMs(1);
    boardIo_writeLed2(true);
    delayMs(1000);
  }
}
