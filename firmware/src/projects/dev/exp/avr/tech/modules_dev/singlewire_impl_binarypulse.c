#include "singlewire.h"

#include "km0/common/bitOperations.h"

#include "digitalIo.h"
#include "km0/types.h"

#include <avr/interrupt.h>
#include <avr/io.h>
#include <util/delay.h>
#include <util/delay_basic.h>

#include "debug_uart.h"
#include <stdio.h>

/*
SingleLineHalfDuplex_PulseRatio_BinaryFragment_SeqMultiBytes
・単線半二重通信の実装
・Low/Highの時間の比率で値を表現する転送方式
・データをLow/Hightの時間の比で表すので、通信速度を事前に決めておく必要がなく、受信側で任意の通信速度に対応できる
・1転送で複数バイトをつなげて送信
・1転送単位のLow/HighのブロックをFragmentと呼ぶ
・受信側では、受信したFragmentの長さの２倍以上のHiを検出すると転送終了とする
*/

//todo: 転送速度を可変でなくハードコードして、通信速度の向上を検討

//50us/bit
//20bit/ms
//20kbps

//---------------------------------------------
//common defs

//ピンはD2で固定
//#define pinHdc P_D2
//汎用性を持たせたいならINT,PCINTがある他のピンでも実現可能と思われる

//1回の通信で最大10バイトまで転送可能とする
#define NumMaxTransmitBytes 10

//#define delayUnit(t)
//{ _delay_loop_1(t); } //読み取りの処理が追いつかず信号が破損する

// #define delayUnit(t)
//   { _delay_loop_1(t * 2); }

// #define delayUnit(t)
//   { _delay_loop_2(t * 10); }

#define DELAY_SC 2
//#define DELAY_SC 20

#define delayUnit(t) \
  { _delay_loop_1(t *DELAY_SC); }

//---------------------------------------------
//timing debug pin

static void debug_initTimeDebugPin() {
  // digitalIo_setOutput(P_D7);
  digitalIo_setOutput(P_E6);
}

static void debug_timingPinLow() {
  bit_off(PORTE, 6);
}

static void debug_timingPinHigh() {
  bit_on(PORTE, 6);
}

static void debug_toggleTimeDebugPin() {
  bit_on(PINE, 6);
  // bit_invert(PORTD, 7);
  //digitalIo_toggle(P_D7);
}

//---------------------------------------------
//signal pin control

//通信に使用するピンはD2(RX)で固定
//汎用性を持たせたいならINT,PCINTがある他のピンでも実現可能と思われる

#define SimulateOpenDrain

#ifdef SimulateOpenDrain

static inline void signalPin_initialize() {
  //defualt state, inputPullup, DDR=0, PORT=1
  digitalIo_setInputPullup(P_D2);
}

static inline void singalPin_startWrite() {
  //hi-z, DDR=0, PORT=0
  bit_off(DDRD, 2);
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
  bit_off(DDRD, 2);
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
  return digitalIo_read(P_D2);
  //return bit_read(PIND, 2);
}

//---------------------------------------------
//sender

static void emitFragmentCore(uint8_t t0, uint8_t t1) {
  // digitalIo_write(pinHdc, 1);
  signalPin_outputHigh();
  delayUnit(t0);
  // digitalIo_write(pinHdc, 0);
  signalPin_outputLow();
  delayUnit(t1);
}

//送信
static void sendBytes(uint8_t *bytes, uint8_t len) {
  if (len > NumMaxTransmitBytes) {
    len = NumMaxTransmitBytes;
  }
  printf("sending A \n");
  cli();

  debug_timingPinHigh();
  delayUnit(100);
  debug_timingPinLow();
  // delayUnit(10);
  // debug_toggleTimeDebugPin();
  // delayUnit(5);
  _delay_us(200);
  // delayUnit(50);

  //digitalIo_setOutput(pinHdc);
  singalPin_startWrite();

  //最初の立ち下りで通信開始を示す
  //digitalIo_setLow(pinHdc);
  signalPin_outputLow();
  debug_toggleTimeDebugPin();
  delayUnit(50);

  //次の立ち上がりから実データを送る

  for (uint8_t bi = 0; bi < len; bi++) {
    uint8_t value = bytes[bi];
    for (int8_t i = 7; i >= 0; i--) {
      uint8_t f = (value >> i) & 1;
      debug_toggleTimeDebugPin();
      if (f == 0) {
        emitFragmentCore(30, 70);
      } else {
        emitFragmentCore(70, 30);
      }
    }
  }
  debug_toggleTimeDebugPin();

  // digitalIo_setInputPullup(pinHdc);
  signalPin_endWrite_standy();

  //送信処理中に発生したピン変化割り込みイベントをクリア
  bit_on(EIFR, INTF2);
  sei();
  // printf("send done\n");
}

//---------------------------------------------
//receiver

static uint8_t rcvBuf[NumMaxTransmitBytes];
volatile static uint8_t gReceiveCount = 0;

typedef void (*TReceiveCallback)(uint8_t *buf, uint8_t len);

static TReceiveCallback receiveCallbackProc = 0;

static void checkReceivedBuffer() {
  if (gReceiveCount != 0) {
    if (receiveCallbackProc) {
      receiveCallbackProc(rcvBuf, gReceiveCount);
    }
    gReceiveCount = 0;
  }
}

#define Fragment_End 2

static uint8_t readFragment(uint16_t *outDur) {
  uint16_t limit = *outDur * 2;
  TCNT3 = 0;
  while (signalPin_read() == 1) {
    if (TCNT3 > limit) {
      return Fragment_End;
    }
  }
  uint16_t t0 = TCNT3;
  TCNT3 = 0;
  while (signalPin_read() == 0) {
    if (TCNT3 > limit) {
      return Fragment_End;
    }
  }
  uint16_t t1 = TCNT3;

  uint16_t dur = t0 + t1;
  *outDur = dur;
  uint16_t mid = dur >> 1;
  if (t0 < mid) {
    return 0;
  } else {
    return 1;
  }
}

//受信
ISR(INT2_vect) {

  // if (isMaster) {
  //   return;
  // }

  debug_toggleTimeDebugPin();

  //Lowからの立ち上がりのタイミングで同期をとる
  bool bad = false;
  TCNT3 = 0;
  while (signalPin_read() == 0) {
    if (TCNT3 > 60000) {
      bad = true;
      break;
    }
  }
  if (bad) {
    printf("ISR, bad receive\n");
    return;
  }
  debug_toggleTimeDebugPin();

  uint8_t bi = 0;

  bool end = false;

  uint16_t outDur = 30000;

  while (bi < NumMaxTransmitBytes) {
    uint8_t value = 0;
    for (int8_t i = 7; i >= 0; i--) {
      uint8_t f = readFragment(&outDur);
      debug_toggleTimeDebugPin();
      if (f == 2) {
        end = true;
        break;
      }
      value |= f << i;
    }
    if (end) {
      break;
    }
    rcvBuf[bi] = value;
    bi++;
  }

  gReceiveCount = bi;
#if 0
  printf("ISR handled\n");
  printf("received %d bytes on ISR\n", gReceiveCount);
#endif

  bit_on(EIFR, INTF2); //処理中に発生したピン変化割り込みイベントをクリア
}

//---------------------------------------------

void singleWire_initialize() {

  //通信に使用するピンを初期化
  // digitalIo_setInputPullup(pinHdc);
  signalPin_initialize();

  //タイミングデバッグ用のピンを初期化
  debug_initTimeDebugPin();

  //タイマ設定, 1分周
  bits_spec(TCCR3B, CS30, 0b111, 0b001);

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
