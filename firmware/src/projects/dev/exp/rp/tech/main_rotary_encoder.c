#include "km0/common/bitOperations.h"
#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/dio.h"
#include "km0/deviceIo/system.h"
#include "km0/keyboard/keyScanner_encoderBasic.h"
#include <stdio.h>

static EncoderConfig appEncoderConfigs[] = {
  { .pin1 = GP16, .pin2 = GP17, .scanIndexBase = 0 },
  { .pin1 = GP18, .pin2 = GP19, .scanIndexBase = 2 },
};

static uint8_t keyStateBitFlags[1] = { 0 };

int main() {
  debugUart_setup(115200);
  printf("start\n");

  dio_setOutput(GP25);
  keyScanner_encoderBasic_initialize(2, appEncoderConfigs);

  int cnt = 0;
  while (true) {
    if (cnt % 4 == 0) {
      keyScanner_encoderBasic_update(keyStateBitFlags);
      for (int i = 0; i < 4; i++) {
        if (bit_read(keyStateBitFlags[0], i)) {
          dio_toggle(GP25);
          printf("encoder stepped %d\n", i);
        }
      }
    }
    if (cnt % 1000 == 0) {
      dio_toggle(GP25);
    }
    cnt++;
    delayMs(1);
  }
}
