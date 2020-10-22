#include "pio.h"
#include "usbiocore.h"

#include <avr/io.h>
#include <stdio.h>
#include <util/delay.h>

#include "debug_uart.h"

#include "bitOperations.h"

//---------------------------------------------
//board IO

#define pin_LED0 P_B0
#define pin_LED1 P_D5

#define pin_BT0 P_B6

static void initBoardIo() {
  pio_setOutput(pin_LED0);
  pio_setOutput(pin_LED1);
  pio_setInputPullup(pin_BT0);
}

static void toggleLED0() {
  pio_toggleOutput(pin_LED0);
}

static void outputLED1(bool val) {
  pio_output(pin_LED1, val);
}

static bool readButton0() {
  return pio_input(pin_BT0) == 0;
}

//---------------------------------------------
//timing debug pin

static void debug_initTimeDebugPin() {
  // pio_setOutput(P_D7);
  pio_setOutput(P_E6);
  bit_on(PORTE, 6);
}

static inline void debug_timingPinLow() {
  bit_off(PORTE, 6);
}

static inline void debug_timingPinHigh() {
  bit_on(PORTE, 6);
}

static inline void debug_toggleTimeDebugPin() {
  bit_on(PINE, 6);
  // bit_invert(PORTD, 7);
  //pio_toggleOutput(P_D7);
}

//---------------------------------------------
//env

// #define pin_LED0 P_F4
// #define pin_LED1 P_F5

// #define pin_BUTTON0 P_B6

// static void initBoardIo() {
//   pio_setOutput(pin_LED0);
//   pio_setOutput(pin_LED1);
//   pio_setInputPullup(pin_BUTTON0);
// }

// static void toggleLED0() {
//   pio_toggleOutput(pin_LED0);
// }

// static void outputLED1(bool val) {
//   pio_output(pin_LED1, val);
// }

// static bool readButton0() {
//   return pio_input(pin_BUTTON0) == 0;
// }

//---------------------------------------------

uint8_t keyUsages[6] = { 0 };

uint8_t rawHidSendBuf[64] = { 0 };
uint8_t rawHidRcvBuf[64] = { 0 };

void emitKeyEvent(uint8_t keyUsage, bool isDown) {
  // static uint16_t count = 0;
  bool done;

  printf("keyEvent %d %d\n", keyUsage, isDown);

#if 1
  keyUsages[0] = isDown ? keyUsage : 0;
  done = usbioCore_hidKeyboard_writeKeyStatus(0, keyUsages);
  if (!done) {
    printf("failed to write key event %d %d\n", keyUsage, isDown);
  }
#endif

#if 1
  uint8_t *p = rawHidSendBuf;
  p[0] = 0xE0;
  p[1] = 2;
  p[2] = isDown ? 0x90 : 0x80;
  p[3] = keyUsage;
  p[4] = 0;
  done = usbioCore_genericHid_writeData(p);
  if (!done) {
    printf("failed to write rawhid data %d %d\n", keyUsage, isDown);
  }
#endif
}

void debugShowBytes(uint8_t *buf, int len) {
  for (uint8_t i = 0; i < len; i++) {
    printf("%02x ", buf[i]);
  }
  printf("\n");
}

void processReadGenericHidData() {
  bool hasData = usbioCore_genericHid_readDataIfExists(rawHidRcvBuf);
  if (hasData) {
    printf("received rawHid Data\n");
    //uint8_t *p = rawHidRcvBuf;
    uint8_t pos = 0;
    uint8_t frameType = rawHidRcvBuf[pos++];
    if (frameType == 0xE0) {
      while (pos < 64) {
        uint8_t len = rawHidRcvBuf[pos++];
        if (len == 0) {
          break;
        }
        debugShowBytes(rawHidRcvBuf + pos, len);
        pos += len;
      }
    }
  }
}

void devEntry() {
  initDebugUART(38400);
  printf("start\n");
  initBoardIo();

  usbioCore_initialize();

  debug_initTimeDebugPin();

  uint8_t cnt = 0;
  bool bst = false;
  while (1) {
    cnt++;
    if (cnt % 10 == 0) {
      bool st = readButton0();
      if (!bst && st) {
        emitKeyEvent(0x04, true);
        outputLED1(true);
      }
      if (bst && !st) {
        emitKeyEvent(0x04, false);
        outputLED1(false);
      }
      bst = st;
    }
    if (cnt % 100 == 0) {
      toggleLED0();
    }
    _delay_ms(1);
    processReadGenericHidData();
  }
}

int main() {
  USBCON = 0;
  devEntry();
  return 0;
}
