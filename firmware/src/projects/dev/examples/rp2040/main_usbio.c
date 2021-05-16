#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/digitalIo.h"
#include "km0/deviceIo/system.h"
#include "km0/deviceIo/usbIoCore.h"
#include <stdio.h>
#include <stdlib.h>

//board RPi Pico
//GP25: onboard LED
//GP0 ---> USB UART ---> PC
//GP16 (internal pullup) <--- button <--- GND

void initLED() {
  digitalIo_setOutput(GP25);
}

void toggleLED() {
  digitalIo_toggle(GP25);
}

void outputLED(bool value) {
  digitalIo_write(GP25, value);
}

void initButton() {
  digitalIo_setInputPullup(GP16);
}

bool isButtonPressed() {
  return digitalIo_read(GP16) == 0;
}

static bool pressed = false;
static uint8_t reportBuf[8] = { 0 };
static uint8_t rawHidSendBuf[64] = { 0 };
static uint8_t rawHidReceiveBuf[64] = { 0 };

void keyboardTesk() {
  bool nextPressed = isButtonPressed();
  if (!pressed && nextPressed) {
    reportBuf[2] = 4;
    usbIoCore_hidKeyboard_writeReport(reportBuf);
    printf("key down\n");

    int base = rand() % 20;
    for (int i = 0; i < 10; i++) {
      rawHidSendBuf[i] = base + i;
    }
    usbIoCore_genericHid_writeData(rawHidSendBuf);

  } else if (pressed && !nextPressed) {
    reportBuf[2] = 0;
    usbIoCore_hidKeyboard_writeReport(reportBuf);
    printf("key up\n");
  }
  pressed = nextPressed;
}

void rawHidReceiveTask() {
  bool received = usbIoCore_genericHid_readDataIfExists(rawHidReceiveBuf);
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
  debugUart_initialize(38400);
  printf("start\n");

  usbIoCore_initialize();

  while (!usbIoCore_isConnectedToHost()) {
    toggleLED();
    usbIoCore_processUpdate();
    delayMs(1);
  }
  printf("connected\n");

  uint32_t cnt = 0;
  while (true) {
    usbIoCore_processUpdate();
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
