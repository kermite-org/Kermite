#include "digitalIo.h"
#include <avr/io.h>
#include <util/delay.h>

#include "debug_uart.h"
#include "km0/base/bitOperations.h"

#include <stdio.h>
#include <stdlib.h>

//デバッグ用ソフトウェアUART出力
//任意のピンで使用可能 になる予定
//F_CPU=16000000, 最適化フラグ-Os で実装, 他の条件では未検証
//16bit Timer1を使用

//baud=38400 で調整, 他のボーレートは使用不可

//---------------------------------------------
//env

#define pin_LED0 P_F4
#define pin_LED1 P_F5

static void initLEDs() {
  digitalIo_setOutput(pin_LED0);
  digitalIo_setOutput(pin_LED1);
}

static void toggleLED0() {
  digitalIo_toggle(pin_LED0);
}

static void outputLED1(bool val) {
  digitalIo_write(pin_LED1, val);
}

//---------------------------------------------
//local

//bool isMaster = false;

static void debug_initTimeDebugPin() {
  // digitalIo_setOutput(P_D7);
  digitalIo_setOutput(P_E6);
}

static void debug_toggleTimeDebugPin() {
  bit_on(PINE, 6);
  // bit_invert(PORTD, 7);
  //digitalIo_toggle(P_D7);
}

uint16_t gTimerTopLogicalValue = 1666; //default 9600baud

//---------------------------------------------

#define pin_DebugUART P_F6

void timingDev1() {

  // bits_spec(TCCR0B, CS00, 0b111, 0b010);

  // bits_spec(TCC)

  TCNT1 = 0;
  OCR1A = 196;
  while (1) {
    while (bit_is_off(TIFR1, OCF1A)) {}
    bit_on(TIFR1, OCF1A);
    TCNT1 = 0;

    bit_on(PINF, 6);
    debug_toggleTimeDebugPin();
    // _delay_us(200);
    // digitalIo_toggle(pin_DebugUART);
  }
}
void unitDelay() {
  // _delay_ms(1);
  // _delay_us(50);
  _delay_loop_1(254);
}

void initTimeStride(uint16_t timerTopValue) {
  //while (bit_is_off(TIFR1, OCF1A)) {}
  OCR1A = timerTopValue;
  bit_on(TIFR1, OCF1A);
  TCNT1 = 0;
}

void waitTimeStride() {
  while (bit_is_off(TIFR1, OCF1A)) {}
  bit_on(TIFR1, OCF1A);
  TCNT1 = 0;
}

//todo
//ソフトウェアUARTの送信ロジックをCで雑に書いているので
//カウンタの調整値が論理値からのずれが大きい/ビルド条件により
//ぶれる可能性がある
//アセンブラで丁寧に作ればカウンタ調整値が理論値に近づくはず

/*
カウンタ上限値 @F_CPU=16000000, XTAL
baud   理論値   調整値
 4800  3333.33  3322
 9600  1666.66  1657
19200   833.33   823
38400   416.66   407
76800   208.33   198
115200  138.88   128

理論値-10ぐらいでよい
-->だめ, ロジックにより変わる
↓ロジックが変わると調整値も変える必要がある。あてにならない
*/
void freqAdjust() {

  uint16_t baud = 9600;

  uint16_t timerTopValue = F_CPU / baud - 10;

  // uint16_t timerTopValue = 3333;

  //uint16_t timerTopValue = 127;

  initTimeStride(timerTopValue);
  while (1) {
    waitTimeStride();
    debug_toggleTimeDebugPin();
  }
}

void softwareUART_putChar(char c) {
  int8_t i;
  uint8_t f;
  // OCR1A = 196;

  if (c == '\n') {
    softwareUART_putChar('\r');
  }

  //タイマ初期化

  //initTimeStride(gTimerTopLogicalValue - 30); //3136); //4800

  /*
 4800  3333.33  3322
 9600  1666.66  1568
19200   833.33   784
38400   416.66   392
76800   208.33   
115200  138.88   
*/

  //initTimeStride(1568); //9600, ok

  //initTimeStride(784); //19200, ok

  initTimeStride(392); //38400, ok

  //initTimeStride(196); //76800

  //initTimeStride(131); //115200

  //スタートビット
  bit_off(PORTF, 6);
  debug_toggleTimeDebugPin();
  waitTimeStride();

  //データ
  for (i = 0; i < 8; i++) {
    f = (c >> i) & 1;
    bit_spec(PORTF, 6, f);
    debug_toggleTimeDebugPin();
    waitTimeStride();
  }

  //ストップビット
  bit_on(PORTF, 6);
  debug_toggleTimeDebugPin();
  waitTimeStride();
}

static FILE mystdout = FDEV_SETUP_STREAM((void *)softwareUART_putChar, NULL, _FDEV_SETUP_WRITE);

void softwareDebugUart_init() { //uint32_t baud) {

  //gTimerTopLogicalValue = F_CPU / baud; // - 10;

  // uart_init(baud);
  stdout = &mystdout;
}

void softwareUART_devEntry() {
  // initDebugUART(38400);

  softwareDebugUart_init();

  // printf("start\n");
  initLEDs();

  digitalIo_setOutput(pin_DebugUART);
  digitalIo_setHigh(pin_DebugUART);

  bits_spec(TCCR1B, CS10, 0b111, 0b001);

  debug_initTimeDebugPin();

  //timingDev1();

  //freqAdjust();

  while (1) {
    // digitalIo_toggle(pin_DebugUART);
    // unitDelay();

    toggleLED0();
    // testWrite();
    // softwareUART_putChar('d');
    printf("hoge\n");
    // printf("abcd");
    _delay_ms(1000);
  }
}

int main() {
  USBCON = 0;

  //blink0();
  //uartTest();
  //blink1();
  //eepromDev();
  softwareUART_devEntry();

  return 0;
}