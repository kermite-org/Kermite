#include "km0/deviceIo/dio.h"
#include "km0/deviceIo/system.h"

//board ProMicro
//B0: onboard RX LED
//D5: onboard TX LED

void blink() {
  dio_setOutput(P_B0);
  dio_setOutput(P_D5);

  while (1) {
    dio_write(P_B0, 1);
    dio_write(P_D5, 1);
    delayMs(500);
    dio_write(P_B0, 0);
    dio_write(P_D5, 0);
    delayMs(500);
  }
}

int main() {
  system_initializeUserProgram();
  blink();
  return 0;
}
