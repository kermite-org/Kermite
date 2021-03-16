#include "debug_uart.h"
#include "dio.h"
#include "singlewire.h"
#include <avr/io.h>
#include <stdio.h>
#include <util/delay.h>

#include <stdio.h>

//---------------------------------------------
//env

#define pin_LED0 P_B0
#define pin_LED1 P_D5

#define pin_BT0 P_B6

#define pin_SlaveCheck P_C6

static void initLEDs() {
  dio_setOutput(pin_LED0);
  dio_setOutput(pin_LED1);
}

static void toggleLED0() {
  dio_toggle(pin_LED0);
}

static void outputLED1(bool val) {
  dio_write(pin_LED1, val);
}

static void initButtons() {
  dio_setInputPullup(pin_BT0);
  //dio_setInputPullup(P_B5);
  //dio_setInputPullup(P_C6);
}

static bool readButton0() {
  return dio_read(pin_BT0) == 0;
}

// static bool readButton1() {
//   return dio_read(P_B5) == 0;
// }

// static bool readButton2() {
//   return dio_read(P_C6) == 0;
// }

static bool checkIsMaster() {
  dio_setInputPullup(pin_SlaveCheck);
  return dio_read(pin_SlaveCheck) == 1;
}

void debugShowBytes(uint8_t *buf, int len) {
  for (uint8_t i = 0; i < len; i++) {
    printf("%02x ", buf[i]);
  }
  printf("\n");
}

//---------------------------------------------
//local
bool isMaster = false;

#define NumMaxTransmitBytes 10

//---------------------------------------------
//development master

void rcvCallback_master(uint8_t *buf, uint8_t len) {
  printf("rcvCallback_master\n");

  printf("%d bytes received\n", len);
  debugShowBytes(buf, len);
}

uint8_t txbuf[NumMaxTransmitBytes];

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

void runAsMaster() {
  printf("run as master\n");
  signleWire_setReceiverCallack(rcvCallback_master);

  bool bst = false;
  uint8_t cnt = 0;
  while (1) {
    if (++cnt == 100) {
      toggleLED0();

      bool st = readButton0();
      if (!bst && st) {
        sendTestData();
      }
      bst = st;
      cnt = 0;
    }
    //checkReceivedBuffer();
    singleWire_processUpdate();
    dio_toggle(P_B4);
    _delay_ms(1);
  }
}

//---------------------------------------------
//development slave

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

void runAsSlave() {
  printf("run as slave\n");
  signleWire_setReceiverCallack(rcvCallback_slave);
  uint8_t cnt = 0;
  while (1) {
    if (++cnt == 200) {
      toggleLED0();
      cnt = 0;
    }
    //checkReceivedBuffer();
    singleWire_processUpdate();
    dio_toggle(P_B4);
    _delay_ms(1);
  }
}

//---------------------------------------------

void singlewire_dev() {
  initDebugUART(38400);
  // initDebugUART(115200);
  // initDebugUART(230400);

  printf("start\n");

  initLEDs();
  initButtons();

  //initWritePort();
  //dio_setInputPullup(pinHdcTx);
  //dio_setInputPullup(pinHdc);

  singleWire_initialize();

  //bool
  isMaster = checkIsMaster();
  //printf("isMaster: %d\n", isMaster ? 1 : 0);

  dio_setOutput(P_B4);

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