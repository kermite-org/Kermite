#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/dio.h"
#include "km0/deviceIo/system.h"
#include <avr/io.h>

//board ProMicro
//B0: onboard LED (sink)
//D5: onboard LED (sink)
//B6 (internal pullup) <--- button <--- GND

void buttonTest() {
  dio_setOutput(P_B0);
  dio_setOutput(P_D5);

  dio_setInputPullup(P_B6);

  while (1) {
    dio_write(P_B0, 0);
    delayMs(100);
    dio_write(P_B0, 1);
    delayMs(100);
    bool isPressed = dio_read(P_B6) == 0;
    dio_write(P_D5, isPressed ? 0 : 1);
  }
}

int main() {
  USBCON = 0;
  buttonTest();
  return 0;
}
