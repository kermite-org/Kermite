#include "debug_uart.h"
#include "digitalIo.h"
#include "km0/base/bitOperations.h"
#include <avr/io.h>
#include <avr/pgmspace.h>
#include <stdio.h>
#include <util/delay.h>

#include "keyMatrixScanner8x8.h"
#include "usbIoCore.h"

//---------------------------------------------
//board io

#define pin_LED0 P_F4
#define pin_LED1 P_F5

static void initBoardIo() {
  digitalIo_setOutput(pin_LED0);
  digitalIo_setOutput(pin_LED1);
}

static void toggleLED0() {
  digitalIo_toggle(pin_LED0);
}

static void outputLED1(bool val) {
  digitalIo_write(pin_LED1, val);
}

//---------------------------------------------
//usbio

uint8_t hidKeyUsages[6] = { 0 };
uint8_t rawHidSendBuf[64] = { 0 };

void emitHidKeyEvent(uint8_t keyUsage, bool isDown) {
  hidKeyUsages[0] = isDown ? keyUsage : 0;
  bool done = usbIoCore_hidKeyboard_writeKeyStatus(0, hidKeyUsages);
  if (!done) {
    printf("failed to write key event %d %d\n", keyUsage, isDown);
  }
}

void emitReadtimeKeyStateEvent(uint8_t keyUsage, bool isDown) {
  uint8_t *p = rawHidSendBuf;
  p[0] = 0xF0;
  p[1] = 2;
  p[2] = isDown ? 0x90 : 0x80;
  p[3] = keyUsage;
  p[4] = 0;
  bool done = usbIoCore_genericHid_writeData(p);
  if (!done) {
    printf("failed to write rawhid data %d %d\n", keyUsage, isDown);
  }
}

//---------------------------------------------
//keymatrix

#define NumRows 3
#define NumColumns 4
#define NumKeys (NumRows * NumColumns)

static const uint8_t rowPins[NumRows] = { P_C6, P_D7, P_E6 };
static const uint8_t columnPins[NumColumns] = { P_F6, P_F7, P_B1, P_B3 };

static uint8_t keyMapping[] = {
  4, 5, 6, 7,
  8, 9, 10, 11,
  12, 13, 14, 15
};

static uint8_t pressedKeyCount = 0;

static void OnKeyStateChanged(uint8_t keyIndex, bool isDown) {

  if (isDown) {
    printf("keydown %d\n", keyIndex);
    pressedKeyCount++;
  } else {
    printf("keyup %d\n", keyIndex);
    pressedKeyCount--;
  }

  uint8_t keyUsage = 0;
  if (0 <= keyIndex && keyIndex < 12) {
    keyUsage = keyMapping[keyIndex];
  }
  if (keyUsage) {
    emitHidKeyEvent(keyUsage, isDown);
    emitReadtimeKeyStateEvent(keyUsage, isDown);
  }
}

//---------------------------------------------

void devEntry() {
  initDebugUART(38400);
  printf("start dev1\n");

  initBoardIo();

  usbIoCore_initialize();

  keyMatrixScanner_initialize(
      NumRows, NumColumns, rowPins, columnPins, OnKeyStateChanged);

  uint16_t cnt = 0;
  while (1) {
    cnt++;
    if (cnt % 10 == 0) {
      keyMatrixScanner_update();
      outputLED1(pressedKeyCount > 0);
    }
    if (cnt % 100 == 0) {
      toggleLED0();
    }
    _delay_ms(1);
  }
}

int main() {
  USBCON = 0;
  devEntry();
  return 0;
}