#include "km0/deviceIo/dataMemory.h"
#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/dio.h"
#include "km0/deviceIo/system.h"
#include "string.h"
#include <stdio.h>

//board RPi Pico
//GP25: onboard LED
//GP0 ---> USB UART ---> PC
//GP16 (internal pullup) <--- button <--- GND

void initLED() {
  dio_setOutput(GP25);
}

void toggleLED() {
  dio_toggle(GP25);
}

void outputLED(bool value) {
  dio_write(GP25, value);
}

void initButton() {
  dio_setInputPullup(GP16);
}

bool isButtonPressed() {
  return dio_read(GP16) == 0;
}

void debugDumpBytes(const uint8_t *buf, size_t len) {
  for (size_t i = 0; i < len; ++i) {
    printf("%02x", buf[i]);
    if (i % 16 == 15)
      printf("\n");
    else
      printf(" ");
  }
  if (len % 16 != 0) {
    printf("\n");
  }
}

const uint32_t storageAddr = 300;
uint8_t databuf[16] = { 0 };

void dumpStorage() {
  printf("read:\n");
  memset(databuf, 0, 16);
  dataMemory_readBytes(storageAddr, databuf, 16);
  debugDumpBytes(databuf, 16);
}

void writeStorage(uint8_t baseValue) {
  for (int i = 0; i < 8; i++) {
    databuf[i] = baseValue;
  }
  printf("writing: %d\n", baseValue);
  debugDumpBytes(databuf, 16);
  dataMemory_writeBytes(storageAddr, databuf, 16);
  printf("write done\n");
}

void blinker(int n, int ms) {
  for (int i = 0; i < n; i++) {
    outputLED(1);
    delayMs(ms);
    outputLED(0);
    delayMs(ms);
  }
}

int frame = 0;

void processExperiment() {
  blinker(4, 50);
  writeStorage(frame % 10);
  dumpStorage();
}

int main() {
  debugUart_setup(38400);
  initLED();
  initButton();

  printf("----start----\n");

  dumpStorage();

  while (1) {
    toggleLED();
    delayMs(1000);
    bool pressed = isButtonPressed();
    if (pressed) {
      processExperiment();
    }
    frame++;
  }
}
