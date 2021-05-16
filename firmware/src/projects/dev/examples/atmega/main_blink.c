#include "km0/deviceIo/digitalIo.h"
#include "km0/deviceIo/system.h"

//board ProMicro
//B0: onboard RX LED
//D5: onboard TX LED

void blink() {
  digitalIo_setOutput(P_B0);
  digitalIo_setOutput(P_D5);

  while (1) {
    digitalIo_write(P_B0, 1);
    digitalIo_write(P_D5, 1);
    delayMs(500);
    digitalIo_write(P_B0, 0);
    digitalIo_write(P_D5, 0);
    delayMs(500);
  }
}

int main() {
  system_initializeUserProgram();
  blink();
  return 0;
}
