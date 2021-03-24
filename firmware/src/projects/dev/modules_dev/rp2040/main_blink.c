#include "dio.h"
#include "system.h"

int main() {
  dio_setOutput(GP25);
  while (true) {
    dio_write(GP25, 1);
    delayMs(1000);
    dio_write(GP25, 0);
    delayMs(1000);
  }
}
