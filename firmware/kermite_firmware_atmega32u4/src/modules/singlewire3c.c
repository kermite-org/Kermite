#include "bit_operations.h"
#include "pio.h"
#include "singlewire3.h"
#include <avr/interrupt.h>
#include <avr/io.h>
#include <util/delay.h>

//単線通信
//singlewire3aの改良版
//パルス幅で0/1を表す
//パルス幅計測による受信
//100kbps

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
#define dBitMask 0x01
#define dISCx0 ISC00
#define dINTx INT0
#define dINTx_vect INT0_vect
#elif defined(SINGLEWIRE_SIGNAL_PIN_PD2)
#define dBit 2
#define dBitMask 0x04
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
  //_delay_loop_1(t * 27); //50kbps
  _delay_loop_1(t * 10); //100kbps
  //_delay_loop_1(t * 7); //130kbps
}

//Highのパルス幅で0/1を表す

static inline void emitLogicalOne() {
  signalPin_setHigh();
  delayUnit(3);
  signalPin_setLow();
  delayUnit(1);
}

static inline void emitLogicalZero() {
  signalPin_setHigh();
  delayUnit(1);
  signalPin_setLow();
  delayUnit(1);
}

static void emitByte(uint8_t value) {
  for (int8_t j = 7; j >= 0; j--) {
    uint8_t f = (value >> j) & 1;
    if (f) {
      emitLogicalOne();
    } else {
      emitLogicalZero();
    }
  }
}

void singlewire_sendFrame(uint8_t *txbuf, uint8_t len) {
  cli();

  signalPin_startTransmit();
  signalPin_setLow();
  delayCore(50);

  emitLogicalZero(); //reference zero
  emitLogicalOne();  //reference one

  uint8_t *p = txbuf;
  uint8_t *p_end = txbuf + len;
  while (1) {
    emitByte(*p++);
    if (p == p_end) {
      break;
    }
    emitLogicalZero();
  }
  emitLogicalOne();
  signalPin_endTransmit_standby();
  bit_on(EIFR, dINTx);
  sei();
}

//信号がLOWのときに次にパルスが立ち上がるまで待つ
//信号線は非通信状態でinput pullupなので、LOWの状態が続いて無限ループになることは考慮しない
static inline void skipLow() {
  while (!(dPIN & dBitMask)) {}
}

static uint8_t measureHigh() {
  uint8_t t0 = 0;
  debug_timingPinHigh();
  while (signalPin_read() != 0 && ++t0 != 0) {}
  debug_timingPinLow();
  return t0;
}

uint8_t singlewire_receiveFrame(uint8_t *rxbuf, uint8_t capacity) {
  uint8_t bi = 0;
  uint8_t t0, t1, TH;
  uint8_t value, m, f, m1, isEnd;

  //相手がまだ送信を開始していない場合、送信開始を待つ
  measureHigh();

  skipLow();
  //measure reference zero
  t0 = measureHigh();
  if (t0 == 0) {
    goto escape;
  }
  skipLow();
  //measure reference one
  t1 = measureHigh();
  if (t1 == 0) {
    goto escape;
  }
  TH = (t0 + t1) >> 1;

  while (bi < capacity) {
    value = 0;
    for (int8_t j = 7; j >= 0; j--) {
      skipLow();
      m = measureHigh();
      if (m == 0) {
        goto escape;
      }
      f = m > TH;
      value |= f << j;
    }
    rxbuf[bi++] = value;
    skipLow();
    m1 = measureHigh();
    if (m1 == 0) {
      goto escape;
    }
    isEnd = m1 > TH;
    if (isEnd) {
      break;
    }
  }
  skipLow();

  debug_timingPinHigh();

  singlewire3_debugValues[0] = t0;
  singlewire3_debugValues[1] = t1;
  singlewire3_debugValues[2] = TH;
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
  sei();
}

ISR(dINTx_vect) {
  if (pReceiverCallback) {
    pReceiverCallback();
  }
}
