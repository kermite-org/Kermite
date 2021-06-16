#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"

//board ProMicro
//B0: onboard LED (sink)
//D5: onboard LED (sink)
//B6 (internal pullup) <--- button <--- GND

void buttonTest() {
  digitalIo_setOutput(P_B0);
  digitalIo_setOutput(P_D5);

  digitalIo_setInputPullup(P_B6);

  while (1) {
    digitalIo_write(P_B0, 0);
    delayMs(100);
    digitalIo_write(P_B0, 1);
    delayMs(100);
    bool isPressed = digitalIo_read(P_B6) == 0;
    digitalIo_write(P_D5, isPressed ? 0 : 1);
  }
}

int main() {
  system_initializeUserProgram();
  buttonTest();
  return 0;
}
