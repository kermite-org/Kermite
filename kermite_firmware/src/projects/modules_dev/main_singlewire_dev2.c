#include "debug_uart.h"
#include "pio.h"
#include <avr/interrupt.h>
#include <avr/io.h>
#include <stdio.h>
#include <util/delay.h>

#include "bitOperations.h"
#include "singlewire2.h"

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

static void toggleLED1() {
  pio_toggleOutput(pin_LED1);
}

static bool readButton0() {
  return pio_input(pin_BT0) == 0;
}

//---------------------------------------------
//interval debug pin

#if 1
static void debug_initDebug3Pin() {
  pio_setOutput(P_B3);
}

static void debug_toggleDebug3Pin() {
  pio_toggleOutput(P_B3);
}

static void debug_outputDebug3Pin(bool val) {
  pio_output(P_B3, val);
}

static void debug_initDebug4Pin() {
  pio_setOutput(P_B2);
}

static void debug_toggleDebug4Pin() {
  pio_toggleOutput(P_B2);
}

static void debug_outputDebug4Pin(bool val) {
  pio_output(P_B2, val);
}

#else
static void debug_initIntervalPin() {}
static void debug_toggleIntervalPin() {}
#endif

//---------------------------------------------
//master slave configuration

#define pin_SlaveCheck P_C6

static bool checkIsMaster() {
  pio_setInputPullup(pin_SlaveCheck);
  return pio_input(pin_SlaveCheck) == 1;
}

//---------------------------------------------

void debugShowBytes(uint8_t *buf, int len) {
  for (uint8_t i = 0; i < len; i++) {
    printf("%02x ", buf[i]);
  }
  printf("\n");
}

//---------------------------------------------
//local
bool isMaster = false;

//---------------------------------------------
//development master

/*
void rcvCallback_master(uint8_t *buf, uint8_t len) {
  printf("rcvCallback_master\n");

  printf("%d bytes received\n", len);
  debugShowBytes(buf, len);
}

void sendTestData() {
  // printf("send\n");
  txbuf[0] = 0xF2;
  txbuf[1] = 0x46;
  txbuf[2] = 0x9A;
  txbuf[3] = 0xCD;
  txbuf[4] = 0xF8;
  txbuf[5] = 0x2A;
  txbuf[6] = 0x12;
  txbuf[7] = 0x34;
  txbuf[8] = 0x56;
  txbuf[9] = 0x78;
  singleWire_sendBytes(txbuf, 6);
}
*/

#define NumMaxDataBytes 6

uint8_t txbuf[NumMaxDataBytes];
uint8_t rxbuf[NumMaxDataBytes];

uint8_t cntVal = 0;

void emitDev() {
  // txbuf[0] = 0b01001010;
  // txbuf[1] = 0b10010100;
  txbuf[0] = 0xCA;
  txbuf[1] = 0x0F;
  txbuf[2] = cntVal++;
  txbuf[3] = 0x3D;
  txbuf[4] = 0x12;
  txbuf[5] = 0x34;
  debug_outputDebug3Pin(0);
  singleWire_sendBytes(txbuf, 4);
  debug_outputDebug3Pin(1);
}

void checkTask() {
  uint8_t sz = singleWire_peekReceivedCount();
  if (sz > 0) {
    debugShowBytes(rxbuf, sz);
  }
}

void runAsMaster() {
  printf("run as master\n");

  singleWire_registerReceiveBuffer(rxbuf, NumMaxDataBytes);
  singleWire_initialize();
  //singleWire_initialize_txonly();

  debug_initDebug3Pin();

  bool bst = false;
  uint8_t cnt = 0;

  sei();
  while (1) {
    if (++cnt == 150) {
      toggleLED0();

      bool st = readButton0();
      if (!bst && st) {
        //sendTestData();
        //emitDev();
      }
      bst = st;
      cnt = 0;

      checkTask();
    }
    //checkReceivedBuffer();
    //singleWire_processUpdate();
    emitDev();
    //debug_toggleIntervalPin();
    // _delay_ms(1);
    _delay_us(300);
  }
}

//---------------------------------------------
//development slave

/*
void rcvCallback_slave(uint8_t *buf, uint8_t len) {

#if 1
  // _delay_ms(100);
  _delay_us(200);
  //echo back
  for (uint8_t i = 0; i < len; i++) {
    txbuf[i] = buf[i] + 1;
  }
  singleWire_sendBytes(txbuf, len);
#endif

#if 0
  printf("rcvCallback_slave\n");
  printf("%d bytes received\n", len);
  debugShowBytes(buf, len);
#endif
}
*/

uint8_t gReceivedCount2 = 0;

void echoBackTask() {
  uint8_t sz = singleWire_peekReceivedCount();
  if (sz >= NumMaxDataBytes) {
    printf("received length too long, %d\n", sz);
    return;
  }
  if (sz > 0) {
    gReceivedCount2 = sz;
    uint8_t n = sz;
    for (uint8_t i = 0; i < n; i++) {
      txbuf[i] = rxbuf[i] + 1;
    }
    debug_outputDebug3Pin(0);
    singleWire_sendBytes(txbuf, n);
    debug_outputDebug3Pin(1);

    // debug_toggleDebug4Pin();
    // toggleLED1();
  }

  // outputLED1(sz > 0);
}

void runAsSlave() {
  printf("run as slave\n");

  singleWire_registerReceiveBuffer(rxbuf, NumMaxDataBytes);
  singleWire_initialize();
  debug_initDebug3Pin();
  debug_initDebug4Pin();
  debug_outputDebug3Pin(1);
  debug_outputDebug4Pin(1);

  uint16_t cnt = 0;

  sei();
  while (1) {
    if (++cnt == 2000) {
      toggleLED0();
      cnt = 0;
      debugShowBytes(rxbuf, gReceivedCount2);
    }
    //checkReceivedBuffer();
    // singleWire_processUpdate();
    //debug_toggleIntervalPin();
    // _delay_ms(1);

    _delay_us(100);

    cli();
    //他の処理による割り込み禁止区間を模擬
    debug_outputDebug4Pin(0);
    _delay_us(10);
    debug_outputDebug4Pin(1);
    sei();

    echoBackTask();
  }
}

//---------------------------------------------

// uint8_t values[] = { 10, 20, 40 };

// void funcdev() {
//   uint8_t c = sumArrayA(values, 3);
//   printf("c: %d\n", c);
// }

void singlewire_dev() {
  initDebugUART(38400);
  printf("start2\n");
  initBoardIo();
  //debug_initIntervalPin();

  isMaster = checkIsMaster();

  if (isMaster) {
    runAsMaster();
  } else {
    runAsSlave();
  }
}

int main() {
  USBCON = 0;
  singlewire_dev();

  return 0;
}