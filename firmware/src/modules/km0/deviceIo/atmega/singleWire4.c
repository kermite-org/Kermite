#include "km0/deviceIo/singleWire4.h"
#include "config.h"
#include "km0/common/bitOperations.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/dio.h"
#include <avr/interrupt.h>
#include <avr/io.h>
#include <string.h>
#include <util/delay.h>

//単線通信
//パルスのDuty比で0/1を表す
//20kbps

//---------------------------------------------

//信号ピン設定
//以下のいずれかをコンパイル時のフラグで注入して指定
//KM0_ATMEGA_SINGLEWIRE__PIN_SIGNAL_PD0
//KM0_ATMEGA_SINGLEWIRE__PIN_SIGNAL_PD2

#define dDDR DDRD
#define dPORT PORTD
#define dPIN PIND

#if defined(KM0_ATMEGA_SINGLEWIRE__PIN_SIGNAL_PD0)
#define dBit 0
#define dISCx0 ISC00
#define dINTx INT0
#define dINTx_vect INT0_vect
#elif defined(KM0_ATMEGA_SINGLEWIRE__PIN_SIGNAL_PD2)
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

#ifdef KM0_ATMEGA_SINGLEWIRE__ENABLE_TIMING_DEBUG_PINS

#define pinDebug P_F4
#define pinDebug_PORT PORTF
#define pinDebug_Bit 4

static void debug_initTimeDebugPin() {
  dio_setOutput(pinDebug);
}

static void debug_timingPinHigh() {
  bit_on(pinDebug_PORT, pinDebug_Bit);
}

static void debug_timingPinLow() {
  bit_off(pinDebug_PORT, pinDebug_Bit);
}
#else

static void debug_initTimeDebugPin() {}
static void debug_timingPinHigh() {}
static void debug_timingPinLow() {}

#endif

//---------------------------------------------
//variables

static uint8_t raw_tx_buf[64];
static uint8_t raw_rx_buf[64];
static uint8_t raw_tx_len = 0;
static uint8_t raw_rx_len = 0;

//---------------------------------------------

static inline void delayUnit(uint8_t t) {
  //_delay_loop_1(t);     //40kbps
  _delay_loop_1(t * 2); // 20kbps
}

/*
HighとLowの時間の比で0/1を表す
high8, low2 ... 1
high3, low7 ... 0
*/
static void writeLogical(uint8_t val) {
  if (val > 0) {
    signalPin_setHigh();
    delayUnit(80);
    signalPin_setLow();
    delayUnit(20);
  } else {
    signalPin_setHigh();
    delayUnit(30);
    signalPin_setLow();
    delayUnit(70);
  }
}

static void transmitFrame(uint8_t *txbuf, uint8_t len) {
  signalPin_startTransmit();
  signalPin_setLow();
  delayUnit(100);
  delayUnit(100);

  for (uint8_t i = 0; i < len; i++) {
    bool isLast = i == len - 1;
    for (int8_t j = 7; j >= 0; j--) {
      uint8_t val = (txbuf[i] >> j) & 1;
      writeLogical(val);
    }
    writeLogical(isLast);
  }

  signalPin_endTransmit_standby();
  delayUnit(100);
  bit_on(EIFR, dINTx);
}

#define ReadAbort 2

static uint8_t readFragment() {
  uint8_t t0 = 0;
  uint8_t t1 = 0;

  debug_timingPinHigh();
  while (signalPin_read() == 1 && ++t0 != 0) {
    delayUnit(1);
  }
  if (t0 == 0) {
    return ReadAbort;
  }

  debug_timingPinLow();
  while (signalPin_read() == 0 && ++t1 != 0) {
    delayUnit(1);
  }
  if (t1 == 0) {
    return ReadAbort;
  }
  uint8_t dur = t0 + t1;
  // singlewire3_debugValue = dur;
  uint8_t mid = dur >> 1;
  return t0 > mid ? 1 : 0;
}

static uint8_t receiveFrame(uint8_t *rxbuf, uint8_t capacity) {
  debug_timingPinLow();
  uint8_t bi = 0;

  uint8_t t0 = 0;
  while (signalPin_read() == 0 && ++t0 != 0) {
    delayUnit(1);
  }
  // singlewire3_debugValue = t0;
  if (t0 == 0) {
    goto escape;
  }

  while (bi < capacity) {
    uint8_t value = 0;
    for (int8_t j = 7; j >= 0; j--) {
      uint8_t f = readFragment();
      if (f == ReadAbort) {
        goto escape;
      }
      value |= f << j;
    }
    rxbuf[bi++] = value;

    uint8_t isEnd = readFragment();
    if (isEnd == ReadAbort) {
      goto escape;
    }
    if (isEnd == 1) {
      break;
    }
  }
  debug_timingPinHigh();
  bit_on(EIFR, dINTx);
  return bi;
escape:
  debug_timingPinHigh();
  bit_on(EIFR, dINTx);
  return 0;
}

void singleWire_initialize() {
  signalPin_endTransmit_standby();
  debug_initTimeDebugPin();
}

void singleWire_writeTxFrame(uint8_t *buf, uint8_t len) {
  memcpy(raw_tx_buf, buf, len);
  raw_tx_len = len;
}

void singleWire_exchangeFramesBlocking() {
  cli();
  transmitFrame(raw_tx_buf, raw_tx_len);
  raw_rx_len = receiveFrame(raw_rx_buf, 64);
  sei();
}

uint8_t singleWire_readRxFrame(uint8_t *buf, uint8_t maxLen) {
  uint8_t len = valueMinimum(raw_rx_len, maxLen);
  memcpy(buf, raw_rx_buf, len);
  return len;
}

//---------------------------------------------
//interrupted receiver

typedef void (*TReceiverCallback)(void);

static TReceiverCallback pReceiverCallback = 0;

void singleWire_setInterruptedReceiver(void (*_pReceiverCallback)(void)) {
  pReceiverCallback = _pReceiverCallback;
  //信号ピンがHIGHからLOWに変化したときに割り込みを生成
  bits_spec(EICRA, dISCx0, 0b11, 0b10);
  bit_on(EIMSK, dINTx);
  sei();
}

void singleWire_clearInterruptedReceiver() {
  pReceiverCallback = 0;
  bits_spec(EICRA, dISCx0, 0b11, 0b00);
  bit_off(EIMSK, dINTx);
}

ISR(dINTx_vect) {
  raw_rx_len = receiveFrame(raw_rx_buf, 64);
  raw_tx_len = 0;
  if (pReceiverCallback) {
    pReceiverCallback();
  }
  if (raw_tx_len > 0) {
    transmitFrame(raw_tx_buf, raw_tx_len);
  }
}
