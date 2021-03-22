#include "debugUart.h"
#include "dio.h"
#include "system.h"
#include "usbioCore.h"
#include <stdio.h>
#include <stdlib.h>

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

static bool pressed = false;
static uint8_t reportBuf[8] = { 0 };
static uint8_t rawHidSendBuf[64] = { 0 };
static uint8_t rawHidReceiveBuf[64] = { 0 };

void keyboardTesk() {
  bool nextPressed = isButtonPressed();
  if (!pressed && nextPressed) {
    reportBuf[2] = 4;
    usbioCore_hidKeyboard_writeReport(reportBuf);
    printf("key down\n");

    int base = rand() % 20;
    for (int i = 0; i < 10; i++) {
      rawHidSendBuf[i] = base + i;
    }
    usbioCore_genericHid_writeData(rawHidSendBuf);

  } else if (pressed && !nextPressed) {
    reportBuf[2] = 0;
    usbioCore_hidKeyboard_writeReport(reportBuf);
    printf("key up\n");
  }
  pressed = nextPressed;
}

void rawHidReceiveTask() {
  bool received = usbioCore_genericHid_readDataIfExists(rawHidReceiveBuf);
  if (received) {
    printf("received:\n");
    for (int i = 0; i < 16; i++) {
      printf("%d,", rawHidReceiveBuf[i]);
    }
    printf("\n");
  }
}

int main() {
  initLED();
  initButton();
  debugUart_setup(38400);
  printf("start\n");

  usbioCore_initialize();

  while (!usbioCore_isConnectedToHost()) {
    toggleLED();
    usbioCore_processUpdate();
    delayMs(1);
  }
  printf("connected\n");

  uint32_t cnt = 0;
  while (true) {
    usbioCore_processUpdate();
    if (cnt % 1000 == 0) {
      toggleLED();
    }
    if (cnt % 10 == 0) {
      keyboardTesk();
    }
    rawHidReceiveTask();
    delayMs(1);
    cnt++;
  }
}
