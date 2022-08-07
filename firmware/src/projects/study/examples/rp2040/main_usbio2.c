#include "km0/device/boardIo.h"
#include "km0/device/boardIoImpl.h"
#include "km0/device/debugUart.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include "km0/device/usbIoCore.h"
#include <stdio.h>
#include <stdlib.h>

// board ProMicroRP2040
// GP0 ---> USB UART ---> PC
// GP9, GP21, GP29 <-- Buttons

void initLED() {
  boardIoImpl_setupLeds_proMicroRp();
}

void toggleLED() {
  boardIo_toggleLed1();
}

void outputLED(bool value) {
  boardIo_writeLed1(value);
}

uint8_t button_pins[] = { GP9, GP21, GP29 };

void initButtons() {
  for (int i = 0; i < 3; i++) {
    digitalIo_setInputPullup(button_pins[i]);
  }
}

bool readButton(int index) {
  return digitalIo_read(button_pins[index]) == 0;
}

static bool pressed0 = false;
static bool pressed1 = false;
static bool pressed2 = false;

static uint8_t reportBuf[8] = { 0 };

void keyboardTask0() {
  bool nextPressed = readButton(0);
  if (!pressed0 && nextPressed) {
    reportBuf[2] = 4;
    usbIoCore_hidKeyboard_writeReport(reportBuf);
    printf("key0 down\n");

  } else if (pressed0 && !nextPressed) {
    reportBuf[2] = 0;
    usbIoCore_hidKeyboard_writeReport(reportBuf);
    printf("key0 up\n");
  }
  pressed0 = nextPressed;
}

void keyboardTask1() {
  bool nextPressed = readButton(1);
  if (!pressed1 && nextPressed) {
    reportBuf[0] = 1 << 1; // right button down
    usbIoCore_hidMouse_writeReport(reportBuf);
    printf("key1 down\n");

  } else if (pressed1 && !nextPressed) {
    reportBuf[0] = 0;
    usbIoCore_hidMouse_writeReport(reportBuf);
    printf("key1 up\n");
  }
  pressed1 = nextPressed;
}

int main() {
  initLED();
  initButtons();
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
      keyboardTask0();
      keyboardTask1();
    }
    delayMs(1);
    cnt++;
  }
}
