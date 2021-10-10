#include "asmGpioDefs.h"
#include "km0/base/bitOperations.h"
#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "km0/device/boardLink.h"
#include <avr/interrupt.h>
#include <avr/io.h>
#include <string.h>
#include <util/delay.h>

//単線通信
//パルスのDuty比で0/1を表す
//20kbps

//---------------------------------------------

//信号ピン設定
//D0, D2のいずれかを利用元から注入して指定

#define dDDR DDRD
#define dPORT PORTD
#define dPIN PIND

//標準ファームウェアで、boardLink_singleWire_setSignalPin()を使って
//実行時に使用するピン(D0 or D2)を変更できるようにdBitを変数として宣言
#if KM0_ATMEGA_SINGLEWIRE__PIN_SIGNAL == P_D0
static uint8_t dBit = 0;
#elif KM0_ATMEGA_SINGLEWIRE__PIN_SIGNAL == P_D2
static uint8_t dBit = 2;
#else
#error Singlewire pin configuration option KM0_ATMEGA_SINGLEWIRE__PIN_SIGNAL is not valid.
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

#define pinDebug P_F5
#define pinDebug_PORT PORTF
#define pinDebug_Bit 5

static void debug_initTimeDebugPin() {
  digitalIo_setOutput(pinDebug);
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

#ifndef KM0_ATMEGA_SINGLEWIRE__BUFFER_SIZE
#define KM0_ATMEGA_SINGLEWIRE__BUFFER_SIZE 16
#endif

#define RawBufferSize KM0_ATMEGA_SINGLEWIRE__BUFFER_SIZE

static uint8_t raw_tx_buf[RawBufferSize];
static uint8_t raw_rx_buf[RawBufferSize];
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
  bit_on(EIFR, dBit);
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
  bit_on(EIFR, dBit);
  return bi;
escape:
  debug_timingPinHigh();
  bit_on(EIFR, dBit);
  return 0;
}

void boardLink_singleWire_setSignalPin(int8_t pin) {
  if (pin == D0 || pin == D2) {
    dBit = pin & 7;
  }
}

void boardLink_initialize() {
  signalPin_endTransmit_standby();
  debug_initTimeDebugPin();
}

void boardLink_writeTxBuffer(uint8_t *buf, uint8_t len) {
  memcpy(raw_tx_buf, buf, len);
  raw_tx_len = len;
}

void boardLink_exchangeFramesBlocking() {
  cli();
  transmitFrame(raw_tx_buf, raw_tx_len);
  raw_rx_len = receiveFrame(raw_rx_buf, RawBufferSize);
  sei();
}

uint8_t boardLink_readRxBuffer(uint8_t *buf, uint8_t maxLen) {
  uint8_t len = valueMinimum(raw_rx_len, maxLen);
  memcpy(buf, raw_rx_buf, len);
  return len;
}

//---------------------------------------------
//interrupted receiver

typedef void (*TReceiverCallback)(void);

static TReceiverCallback pReceiverCallback = 0;

void boardLink_setupSlaveReceiver(void (*_pReceiverCallback)(void)) {
  pReceiverCallback = _pReceiverCallback;

  //信号ピンがHIGHからLOWに変化したときに割り込みを生成
  if (dBit == 0) {
    bits_spec(EICRA, ISC00, 0b11, 0b10);
    bit_on(EIMSK, INT0);
  } else {
    bits_spec(EICRA, ISC20, 0b11, 0b10);
    bit_on(EIMSK, INT2);
  }

  sei();
}

void boardLink_clearSlaveReceiver() {
  pReceiverCallback = 0;
  if (dBit == 0) {
    bits_spec(EICRA, ISC00, 0b11, 0b00);
    bit_off(EIMSK, INT0);
  } else {
    bits_spec(EICRA, ISC20, 0b11, 0b00);
    bit_off(EIMSK, INT2);
  }
}

static void isrImpl() {
  raw_rx_len = receiveFrame(raw_rx_buf, RawBufferSize);
  raw_tx_len = 0;
  if (pReceiverCallback) {
    pReceiverCallback();
  }
  if (raw_tx_len > 0) {
    transmitFrame(raw_tx_buf, raw_tx_len);
  }
}

ISR(INT0_vect) {
  if (dBit == 0) {
    isrImpl();
  }
}

ISR(INT2_vect) {
  if (dBit == 2) {
    isrImpl();
  }
}
