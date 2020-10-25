#include <avr/io.h>

#include "debug_uart.h"
#include "pio.h"

#include <util/delay.h>

#include "bitOperations.h"
#include <avr/interrupt.h>
#include <util/delay_basic.h>

#include <stdio.h>

/*
SingleLineHalfDuplex_StartStopSynchronous_SeqMultiBytes
・単線半二重通信の実装
・スタートビットの立下りを基準にタイミングをとる調歩同期式
・転送速度は固定(master/slaveにそれぞれハードコード)
・1転送で複数バイトをつなげて送信
*/

/*
データフレーム形式
 l h v v v v v v v v c v v v v v v v v c v v ... v v c v v v v v v v v
l: スタートビット, LOW
h: タイミング調整ビット, HIGH
v: バイト値, MSB-first, 正論理
c: 継続フラグ, 後続のバイト値があるなら物理Low, ないなら物理High
最大10バイトまで継続可能
*/

//LHDDDDDDDDCDDDDDDDDCDD..DDT
//L low
//h High
//D data, 0 or 1
//C continue 0
//T terminate 1
//最初のL-->Hのタイミングで同期をとる
//max 10bytes

//maseter-->slave, 1バイト送信..ok
//maseter-->slave, 6バイト送信..ok, 32kbps
//slave-->master返信, ok

//---------------------------------------------
//env

static void initLEDs() {
  pio_setOutput(P_F4);
  pio_setOutput(P_F5);
}

static void toggleLED0() {
  pio_toggleOutput(P_F4);
}

static void toggleLED1() {
  pio_toggleOutput(P_F5);
}

static void outputLED1(bool val) {
  pio_output(P_F5, val);
}

static void initButtons() {
  pio_setInputPullup(P_B6);
  //pio_setInputPullup(P_B5);
  //pio_setInputPullup(P_C6);
}

static bool readButton0() {
  return pio_input(P_B6) == 0;
}

// static bool readButton1() {
//   return pio_input(P_B5) == 0;
// }

// static bool readButton2() {
//   return pio_input(P_C6) == 0;
// }

static bool checkIsMaster() {
  pio_setInputPullup(P_D4);
  return pio_input(P_D4) == 1;
}

void debugShowBytes(uint8_t *buf, int len) {
  for (uint8_t i = 0; i < len; i++) {
    printf("%02x ", buf[i]);
  }
  printf("\n");
}

//---------------------------------------------
//local

#define NumMaxTransmitBytes 10
#define kZero 0
#define kOne 1
#define kContinuator 2
#define kTerminator 3
#define kTail 4

bool isMaster = false;
//volatile bool sending = false;

#define pinHdc P_D2

uint8_t txbuf[NumMaxTransmitBytes];

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

#define pin_timingDebug P_E6

//TimerUnit=1u, for 10bytes, totalCount=0.5u+9u*10+1u, 91.5u

#define TimeUnit 200 //about 32kbps
//#define TimeUnit 100 //about 64kbs, 受信側で処理が間に合わずデータが破損

//---------------------------------------------

typedef struct {
  //volatile uint8_t *reg_DDR;
  volatile uint8_t *reg_PORT;
  volatile uint8_t *reg_PIN;
  uint8_t portBit;
} TFastIoPortSpec;

void fio_configureIoPort(TFastIoPortSpec *spec, uint8_t pin) {
  spec->portBit = pio_ex_getPortBit(pin);
  spec->reg_PORT = pio_ex_getRegPORTX(pin);
  spec->reg_PIN = pio_ex_getRegPINX(pin);
}

//inline
void fio_toggleOutput(TFastIoPortSpec *spec) {
  // bit_invert(*spec->reg_PORT, spec->portBit);
  bit_on(*spec->reg_PIN, spec->portBit);
}

TFastIoPortSpec fio_timingDebug;

void debug_toggleTimeDebugPin() {
  bit_on(PINE, 6);
}

void debug_toggleTimeDebugPin2() {
  bit_invert(PORTE, 6);
}

//送信
void sendBytes(uint8_t *bytes, uint8_t len) {

  uint16_t till;

  printf("sending 1\n");
  cli();

  pio_setOutput(pinHdc);
  pio_output(pinHdc, 1);
  bits_spec(TCCR3B, CS30, 0b111, 0b001); //タイマ設定, 分周
  volatile uint8_t *reg_PORT = pio_ex_getRegPORTX(pinHdc);
  uint8_t portBit = pio_ex_getPortBit(pinHdc);

  till = TimeUnit;
  TCNT3 = 0;
  //half duration start bit

  //最初の立ち下りで通信開始を示す
  //start half-bit
  bit_off(*reg_PORT, portBit);
  // bit_spec(*reg_PORT, portBit, 0);
  //pio_toggleOutput(pin_timingDebug);
  debug_toggleTimeDebugPin();
  while (TCNT3 < till) {}

  //次の立ち上がりをタイミング同期の起点とする
  till = TimeUnit;
  TCNT3 = 0;
  bit_on(*reg_PORT, portBit);
  debug_toggleTimeDebugPin();

  for (uint8_t bi = 0; bi < len; bi++) {
    uint8_t value = bytes[bi];
    for (int8_t i = 7; i >= 0; i--) {
      uint8_t f = value >> i & 1;
      while (TCNT3 < till) {}
      bit_spec(*reg_PORT, portBit, f);
      //pio_toggleOutput(pin_timingDebug);
      debug_toggleTimeDebugPin();
      till += TimeUnit;
    }
    uint8_t contFlagBit = (bi == len - 1) ? 1 : 0;
    while (TCNT3 < till) {}
    bit_spec(*reg_PORT, portBit, contFlagBit);
    //pio_toggleOutput(pin_timingDebug);
    debug_toggleTimeDebugPin();

    till += TimeUnit;
  }

  bit_on(EIFR, INTF2); //送信処理中に発生したピン変化割り込みイベントをクリア

  pio_setInputPullup(pinHdc);
  sei();
  printf("send done\n");
}

//受信
ISR(INT2_vect) {
  uint16_t till;

  // if (isMaster) {
  //   return;
  // }
  // bits_spec(TCCR3B, CS30, 0b111, 0b001); //分周なし
  // pio_toggleOutput(pin_timingDebug);
  // fio_toggleOutput(&fio_timingDebug);
  debug_toggleTimeDebugPin();

  volatile uint8_t *reg_PIN = pio_ex_getRegPINX(pinHdc);
  uint8_t portBit = pio_ex_getPortBit(pinHdc);

  uint8_t bi = 0;

  //Lowからの立ち上がりの時点で同期をとる
  TCNT3 = 0;
  bool bad = false;
  while (bit_is_off(*reg_PIN, portBit)) {
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
  till = TimeUnit + (TimeUnit >> 1);
  TCNT3 = 0;

  while (bi < NumMaxTransmitBytes) {
    uint8_t value = 0;
    for (int8_t i = 7; i >= 0; i--) {
      while (TCNT3 < till) {}
      uint8_t f = bit_read(*reg_PIN, portBit);
      //pio_toggleOutput(pin_timingDebug);
      // fio_toggleOutput(&fio_timingDebug);
      //pio_toggleOutput_2(pin_timingDebug);
      debug_toggleTimeDebugPin();

      // printf("f: %d\n", f);
      //toggleLED1();
      till += TimeUnit;
      value |= f << i;
    }
    rcvBuf[bi] = value;
    while (TCNT3 < till) {}
    uint8_t contFlagBit = bit_read(*reg_PIN, portBit);
    //pio_toggleOutput(pin_timingDebug);
    //fio_toggleOutput(&fio_timingDebug);
    //pio_toggleOutput_2(pin_timingDebug);
    debug_toggleTimeDebugPin();
    // printf("cont: %d\n", contFlagBit);
    till += TimeUnit;
    bi++;
    if (contFlagBit == 1) {
      break;
    }
  }
  gReceiveCount = bi;
  printf("ISR ocurred\n");
  printf("received %d bytes on ISR\n", gReceiveCount);

  bit_on(EIFR, INTF2); //処理中に発生したピン変化割り込みイベントをクリア
}

//---------------------------------------------
//development slave

void rcvCallback_slave(uint8_t *buf, uint8_t len) {

  debug_toggleTimeDebugPin();

  for (uint8_t i = 0; i < 4; i++) {
    debug_toggleTimeDebugPin();
    _delay_us(50);
  }

  printf("rcvCallback_slave\n");
  printf("%d bytes received\n", len);
  debugShowBytes(buf, len);

#if 1
  //_delay_ms(100);
  //echo back
  for (uint8_t i = 0; i < len; i++) {
    buf[i] += 1;
  }
  sendBytes(buf, len);

  debug_toggleTimeDebugPin();
  printf("callback end\n");

#endif
}

void runAsSlave() {
  printf("run as slave\n");

  receiveCallbackProc = rcvCallback_slave;
  uint8_t cnt = 0;
  while (1) {
    if (++cnt == 200) {
      toggleLED0();
      cnt = 0;
    }
    checkReceivedBuffer();
    //_delay_ms(1);
    _delay_us(100);
  }
}
//---------------------------------------------

void sendTestData() {
  // printf("send\n");
  txbuf[0] = 0x32;
  txbuf[1] = 0x34;
  txbuf[2] = 0x78;
  txbuf[3] = 0xCD;
  txbuf[4] = 0xF8;
  txbuf[5] = 0x2A;
  txbuf[6] = 0x12;
  txbuf[7] = 0x34;
  txbuf[8] = 0x56;
  txbuf[9] = 0x78;
  sendBytes(txbuf, 10);
  //sendBytes(txbuf, 1);
}

void rcvCallback_master(uint8_t *buf, uint8_t len) {

  debug_toggleTimeDebugPin2();

  for (uint8_t i = 0; i < 4; i++) {
    debug_toggleTimeDebugPin2();
    _delay_us(50);
  }

  printf("rcvCallback_master\n");
  printf("%d bytes received\n", len);
  debugShowBytes(buf, len);
}

void runAsMaster2() {
  printf("run as master2\n");
  receiveCallbackProc = rcvCallback_master;

  pio_setOutput(pinHdc);
  pio_setHigh(pinHdc);

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
    //signalTimingDev();
    checkReceivedBuffer();
    _delay_ms(1);
  }
}

//---------------------------------------------

void singlewire_dev() {
  initDebugUART(38400);

  printf("start\n");

  initLEDs();
  initButtons();

  pio_setInputPullup(pinHdc);
  bits_spec(TCCR3B, CS30, 0b111, 0b001); //タイマ設定, 分周なし

  pio_setOutput(pin_timingDebug);
  pio_setHigh(pin_timingDebug);
  fio_configureIoPort(&fio_timingDebug, pin_timingDebug);

  //bool
  isMaster = checkIsMaster();
  printf("isMaster: %d\n", isMaster ? 1 : 0);

#if 1
  //PD2がHIGHからLOWに変化したときに割り込みを生成
  bits_spec(EICRA, ISC20, 0b11, 0b10);
  bit_on(EIMSK, INT2);
  sei();
#endif

  if (isMaster) {
    runAsMaster2();
  } else {
    runAsSlave();
  }
}

int main() {
  USBCON = 0;
  singlewire_dev();

  return 0;
}