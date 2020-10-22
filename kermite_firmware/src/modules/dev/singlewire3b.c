#include "bitOperations.h"
#include "pio.h"
#include "singlewire3.h"
#include <avr/interrupt.h>
#include <avr/io.h>
#include <util/delay.h>

//単線通信
//パルス幅で0/1を表す
//立ち上がり一定時間後の信号サンプリングによる受信
//160kpbs

uint8_t singlewire3_debugValues[4] = { 0 };

//---------------------------------------------

//信号ピン設定
//以下のいずれかをコンパイル時のフラグで注入して指定
//SINGLEWIRE_SIGNAL_PIN_PD0
//SINGLEWIRE_SIGNAL_PIN_PD2

#define dDDR DDRD
#define dPORT PORTD
#define dPIN PIND

#if defined(SINGLEWIRE_SIGNAL_PIN_PD0)
#define dBit 0
#define dISCx0 ISC00
#define dINTx INT0
#define dINTx_vect INT0_vect
#elif defined(SINGLEWIRE_SIGNAL_PIN_PD2)
#define dBit 2
#define dISCx0 ISC20
#define dINTx INT2
#define dINTx_vect INT2_vect
#else
#error Singlewire pin configuration option SINGLEWIRE_SIGNAL_PIN_PDx is not provided.
#endif

//---------------------------------------------
//signal pin control

static inline void signalPin_startTransmit() {
  //output high, DDR=1, PORT=1
  bit_on(dDDR, dBit);
  bit_on(dPORT, dBit);
}

static inline void signalPin_endTransmit_standby() {
  //input with pullup, DDR=0, PORT=1
  bit_off(dDDR, dBit);
  bit_on(dPORT, dBit);
}

static inline void signalPin_setHigh() {
  bit_on(dPORT, dBit);
}

static inline void signalPin_setLow() {
  bit_off(dPORT, dBit);
}

static inline uint8_t signalPin_read() {
  return bit_read(dPIN, dBit);
}

//---------------------------------------------
//timing debug pin

#ifdef SINGLEWIRE_ENABLE_TIMING_DEBUG_PINS

#define pinDebug P_F4
#define pinDebug_PORT PORTF
#define pinDebug_Bit 4

static inline void debug_initTimeDebugPin() {
  pio_setOutput(pinDebug);
}

static inline void debug_timingPinHigh() {
  bit_on(pinDebug_PORT, pinDebug_Bit);
}

static inline void debug_timingPinLow() {
  bit_off(pinDebug_PORT, pinDebug_Bit);
}

#else

static void debug_initTimeDebugPin() {}
static void debug_timingPinHigh() {}
static void debug_timingPinLow() {}

#endif

//---------------------------------------------

static inline void delayCore(uint8_t t) {
  _delay_loop_1(t);
}

static inline void delayUnit(uint8_t t) {
  _delay_loop_1(t * 5);
}

static inline void skipLow() {
  while (signalPin_read() == 0) {}
}

static void skipHigh() {
  uint8_t t0 = 0;
  debug_timingPinHigh();
  while (signalPin_read() != 0 && ++t0) {}
  debug_timingPinLow();
}

//ビット送信
//Highのパルス幅で0/1を表す
static void writeLogical(uint8_t val) {
  if (val > 0) {
    signalPin_setHigh();
    delayUnit(3);
    signalPin_setLow();
    delayUnit(1);
  } else {
    signalPin_setHigh();
    delayUnit(1);
    signalPin_setLow();
    delayUnit(1);
  }
}

//ビット受信
//各パルスに対して、信号が立ち上がってから一定時間後にレベルを見て、そのパルスが表現しているビットの論理値を判別する
static uint8_t readFragment() {
  debug_timingPinHigh();
  delayUnit(1);
  debug_timingPinLow();
  uint8_t val = signalPin_read() ? 1 : 0;
  if (val) {
    skipHigh();
  }
  return val;
}

void singlewire_sendFrame(uint8_t *txbuf, uint8_t len) {
  signalPin_startTransmit();
  signalPin_setLow();
  // delayUnit(2);
  delayCore(30);

  for (uint8_t i = 0; i < len; i++) {
    bool isLast = i == len - 1;
    for (int8_t j = 7; j >= 0; j--) {
      uint8_t val = (txbuf[i] >> j) & 1;
      writeLogical(val);
    }
    writeLogical(isLast);
  }

  signalPin_endTransmit_standby();
  bit_on(EIFR, dINTx);
}

uint8_t singlewire_receiveFrame(uint8_t *rxbuf, uint8_t capacity) {
  uint8_t bi = 0;
  uint8_t value, isEnd, f;

  //相手がまだ送信を開始していない場合、送信開始を待つ
  skipHigh();

  while (bi < capacity) {
    value = 0;
    for (int8_t j = 7; j >= 0; j--) {
      skipLow();
      f = readFragment();
      value |= f << j;
    }
    rxbuf[bi++] = value;
    skipLow();
    isEnd = readFragment();
    if (isEnd) {
      break;
    }
  }
  skipLow();

  debug_timingPinHigh();
  bit_on(EIFR, dINTx);
  return bi;
escape:
  debug_timingPinHigh();
  bit_on(EIFR, dINTx);
  return 0;
}

void singlewire_initialize() {
  signalPin_endTransmit_standby();
  debug_initTimeDebugPin();
}

//---------------------------------------------
//interrupted receiver

typedef void (*TReceiverCallback)(void);

static TReceiverCallback pReceiverCallback = 0;

void singlewire_setupInterruptedReceiver(void (*_pReceiverCallback)(void)) {
  pReceiverCallback = _pReceiverCallback;
  //信号ピンがHIGHからLOWに変化したときに割り込みを生成
  bits_spec(EICRA, dISCx0, 0b11, 0b10);
  bit_on(EIMSK, dINTx);
}

void singlewire_clearInterruptedReceiver() {
  pReceiverCallback = 0;
  bits_spec(EICRA, dISCx0, 0b11, 0b00);
  bit_off(EIMSK, dINTx);
}

ISR(dINTx_vect) {
  if (pReceiverCallback) {
    pReceiverCallback();
  }
}
