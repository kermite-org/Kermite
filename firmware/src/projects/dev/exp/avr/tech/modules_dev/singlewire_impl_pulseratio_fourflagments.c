#include "singlewire.h"

#include "debug_uart.h"
#include "digitalIo.h"
#include "km0/base/bitOperations.h"
#include "km0/types.h"

#include <avr/interrupt.h>
#include <avr/io.h>
#include <util/delay.h>
#include <util/delay_basic.h>

#if 1
#include <stdio.h>
#endif

/*
SingleLineHalfDuplex_PulseRatio_FourFragment_SeqMultiBytes
・単線半二重通信の実装
・Low/Highの時間の比率で値を表現する転送方式
・Low/High/Continue/Terminateの4つのFragment(送信最小単位)を並べてデータを送信
・データをLow/Hightの時間の比で表すので、通信速度を事前に決めておく必要がなく、受信側で任意の通信速度に対応できる
・1転送で複数バイトをつなげて送信
・現状の実装では1Fragment=60us(16kbps), これ時間を以上詰めるとデータが破損
*/

//---------------------------------------------
//common defs

//1回の通信で最大10バイトまで転送可能とする
#define NumMaxTransmitBytes 10

#define kZero 0
#define kOne 1
#define kContinuator 2
#define kTerminator 3
// #define kTail 4

//volatile bool sending = false;

//#define delayUnit _delay_ms

//#define delayUnit(t)
//{ _delay_loop_1(t); } //読み取りの処理が追いつかず信号が破損する

#define delayUnit(t) \
  { _delay_loop_1(t * 2); }

// static inline void delayUnit(uint8_t t) {
//   _delay_loop_1(t * 2);
// }

//200delayUnit/Fragment
//60us/Fragment
//2Byte/ms
//16kbps

//---------------------------------------------
//signal pin control

//通信に使用するピンはD2(RX)で固定
#define pinHdc P_D2
//汎用性を持たせたいならINT,PCINTがある他のピンでも実現可能と思われる

#define SimulateOpenDrain

#ifdef SimulateOpenDrain

static inline void signalPin_initialize() {
  //defualt state, inputPullup, DDR=0, PORT=1
  digitalIo_setInputPullup(pinHdc);
}

static inline void singalPin_startWrite() {
  //hi-z, DDR=0, PORT=0
  bit_off(PORTD, 2);
}

static inline void signalPin_outputLow() {
  //drive low, DDR=1, PORT=0
  bit_on(DDRD, 2); //drive low
}

static inline void signalPin_outputHigh() {
  //hi-z, DDR=0, PORT=0
  bit_off(DDRD, 2);
}

static inline void signalPin_endWrite_standy() {
  //inputPullup, DDR=0, PORT=1
  bit_on(PORTD, 2);
}

#else

static inline void singalPin_startWrite() {
  digitalIo_setOutput(pinHdc);
}

static inline void signalPin_endWrite() {
  digitalIo_setInputPullup(pinHdc);
}

static inline void signalPin_outputHigh() {
  digitalIo_write(pinHdc, 1);
}

static inline void signalPin_outputLow() {
  digitalIo_write(pinHdc, 0);
}
#endif

static inline uint8_t signalPin_read() {
  // return digitalIo_read(pinHdc);
  return bit_read(PIND, 2);
}

//---------------------------------------------

static inline void emitFragmentCore(uint8_t t0, uint8_t t1) {
  signalPin_outputLow();
  delayUnit(t0);
  signalPin_outputHigh();
  delayUnit(t1);
}

void emitFragment(uint8_t val) {
  if (val == kContinuator) {
    emitFragmentCore(12, 88);
  } else if (val == kZero) {
    emitFragmentCore(36, 64);
  } else if (val == kOne) {
    emitFragmentCore(64, 36);
  } else if (val == kTerminator) {
    emitFragmentCore(88, 12);
  }
}

static inline void emitTail() {
  // digitalIo_write(pinHdc, 0);
  signalPin_outputLow();
  delayUnit(50);
  // digitalIo_write(pinHdc, 1);
  signalPin_outputHigh();
}

void sendByte(uint8_t value) {
  for (int8_t i = 7; i >= 0; i--) {
    emitFragment((value >> i) & 1);
  }
}

void sendBytes(uint8_t *buf, uint8_t len) {
  printf("sending\n");

  //bit_off(EIMSK, INT2);
  cli();

  //sending = true;

  // singalPin_startOutput();
  singalPin_startWrite();
  // digitalIo_write(pinHdc, 1);
  signalPin_outputHigh();
  delayUnit(50);

  for (uint8_t i = 0; i < len; i++) {
    sendByte(buf[i]);
    if (i < len - 1) {
      emitFragment(kContinuator);
    } else {
      emitFragment(kTerminator);
    }
  }
  emitTail();
  signalPin_endWrite_standy();

  //sending = false;

  //bit_on(EIMSK, INT2);
  bit_on(EIFR, INTF2); //送信処理中に発生したピン変化割り込みイベントをクリア
  sei();
  printf("send done\n");
}

//---------------------------------------------
//receiver

//#define pinHdcRx P_D2

bool dataBroken = false;

uint8_t readFlagment() {
  uint8_t t0 = 0;
  uint8_t t1 = 0;
  while (signalPin_read() == 0) {
    delayUnit(1);
    t0++;
    if (t0 >= 200) {
      //printf("bad\n");
      dataBroken = true;
      return 0xFF;
    }
  }
  while (signalPin_read() == 1) {
    delayUnit(1);
    t1++;
    if (t1 >= 200) {
      //printf("bad\n");
      dataBroken = true;
      return 0xFF;
    }
  }
  uint8_t dur = t0 + t1;
  uint8_t mid = dur >> 1;
  uint8_t q = dur >> 2;
  if (t0 < q) {
    return kContinuator;
  } else if (t0 < mid) {
    return kZero;
  } else if (t0 < dur - q) {
    return kOne;
  } else {
    return kTerminator;
  }
}

void readTail() {
  while (signalPin_read() == 0) {}
}

// uint8_t receiveHalfFlagment() {
//   uint8_t t0 = 0;
//   //uint8_t t1 = 0;
//   while (digitalIo_read(pinOneWireRx) == 0) {
//     _delay_ms(1);
//     t0++;
//   }
// }

uint8_t receiveByte() {
  uint8_t val = 0;
  for (int8_t i = 7; i >= 0; i--) {
    uint8_t f = readFlagment();
    val |= f << i;
  }
  return val;
}

uint8_t rcvBuf[NumMaxTransmitBytes];
uint8_t gReceiveCount = 0;

//bool hasRecivedData = false;

typedef void (*TReceiveCallback)(uint8_t *buf, uint8_t len);

TReceiveCallback receiveCallbackProc = 0;

void checkReceivedBuffer() {
  if (gReceiveCount != 0) {
    if (receiveCallbackProc) {
      receiveCallbackProc(rcvBuf, gReceiveCount);
    }
    gReceiveCount = 0;
  }
}

ISR(INT2_vect) {

  // if (isMaster) {
  //   return;
  // }

  // if (sending) {
  //   //printf("sending, return\n");
  //   return;
  // }

  // cli();
  //bit_off(EIMSK, INT2);

  // bit_off(EIMSK, INT2);

  dataBroken = false;

  uint8_t rcvCount = 0;
  for (uint8_t i = 0; i < NumMaxTransmitBytes; i++) {
    rcvBuf[i] = receiveByte();
    rcvCount++;
    uint8_t f = readFlagment();
    if (f == kTerminator) {
      break;
    }
  }
  readTail();

  if (!dataBroken) {
    // printf("ISR int2 vect\n");
    gReceiveCount = rcvCount;
  } else {
    printf("received data broken!\n");
  }

  //receiveFlagment(); //mark
  //receiveFlagment(); //end mark
  //receiveHalfFlagment();
  //printf("byte received: %d\n", byte);
  //_delay_ms(1000);

  //bit_off(EIFR, INTF2);
  // sei();
  // bit_on(EIMSK, INT2);

  //bit_on(EIMSK, INT2);

  bit_on(EIFR, INTF2); //処理中に発生したピン変化割り込みイベントをクリア
}

//---------------------------------------------

void singleWire_initialize() {
  signalPin_initialize();

  //ピンがHIGHからLOWに変化したときに割り込みを生成
  bits_spec(EICRA, ISC20, 0b11, 0b10);
  bit_on(EIMSK, INT2);
  sei();
}

void signleWire_setReceiverCallack(void (*proc)(uint8_t *bytes, uint8_t len)) {
  receiveCallbackProc = proc;
}
void singleWire_sendBytes(uint8_t *bytes, uint8_t len) {
  sendBytes(bytes, len);
}
void singleWire_processUpdate() {
  checkReceivedBuffer();
}