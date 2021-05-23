#include <avr/io.h>

#include "debugUart.h"
#include "digitalIo.h"

#include <util/delay.h>

#include "km0/base/bitOperations.h"
#include <avr/interrupt.h>
#include <util/delay_basic.h>

#include <stdio.h>

#include "asmdev.h"

//---------------------------------------------
//env

#define pin_LED0 P_B0
#define pin_LED1 P_D5

#define pin_BT0 P_B6

static void initBoardIo() {
  digitalIo_setOutput(pin_LED0);
  digitalIo_setOutput(pin_LED1);
  digitalIo_setInputPullup(pin_BT0);
}

static void toggleLED0() {
  digitalIo_toggle(pin_LED0);
}

static void outputLED1(bool val) {
  digitalIo_write(pin_LED1, val);
}

static bool readButton0() {
  return digitalIo_read(pin_BT0) == 0;
}

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

#define pin_NeoPixel P_D4

static void neoPixelPin_initialize() {
  digitalIo_setOutput(pin_NeoPixel);
}

static inline void neoPixelPin_setHigh() {
  bit_on(PORTD, 4);
}

static inline void neoPixelPin_setLow() {
  bit_off(PORTD, 4);
}

//---------------------------------------------

//todo: 帯域20MHz程度のオシロがないと確認ができない
//0.4us HIGH/0.8us LOWのようなパルスを出したい

void emit8bit(uint8_t value) {

  for (int8_t i = 7; i >= 0; i--) {
    uint8_t f = value >> i & 1;
    if (f == 0) {
      neoPixelPin_setHigh();
      _delay_loop_1(1);
      //_delay_us(4);
      neoPixelPin_setLow();
      //_delay_us(8);
      _delay_loop_1(1);
    } else {
      neoPixelPin_setHigh();
      //_delay_us(8);
      _delay_loop_1(8);
      neoPixelPin_setLow();
      //_delay_us(4);
      _delay_loop_1(4);
    }
  }
}

uint32_t color = 0xFF0022;

void emitDev() {
  // color++;
  uint8_t r = color >> 16 & 0xFF;
  uint8_t g = color >> 8 & 0xFF;
  uint8_t b = color & 0xFF;
  debug_timingPinLow();
  emitNeoPixelByte(g);
  emitNeoPixelByte(r);
  emitNeoPixelByte(b);
  debug_timingPinHigh();
  // for (int8_t i = 0; i < 4; i++) {
  //   // foo();
  //   debug_timingPinLow();
  //   // foo0();
  //   // foo1();
  //   // neoPixelPin_setHigh();
  //   // neoPixelPin_setLow();
  //   foo2(0b11001010);
  //   foo2(0b11110000);
  //   foo2(0b01101001);
  //   debug_timingPinHigh();
  //   _delay_us(5);
  // }
}

void emitLedColorSpec() {

  neoPixelPin_setLow();
  _delay_us(55);

  uint32_t color = 0x00FF0088;

  emit8bit(color >> 8 & 0xFF); //green
  // emit8bit(color >> 16 & 0xFF); //red
  // emit8bit(color & 0xFF);       //blue

  neoPixelPin_setLow();
  _delay_us(55);
  neoPixelPin_setHigh();
}

void neopixel_dev() {
  debugUart_initialize(38400);

  printf("start\n");
  uint8_t c = sum(10, 20);
  printf("sum result: %d\n", c);

  initBoardIo();
  neoPixelPin_initialize();
  debug_initTimeDebugPin();

  bool bst = false;
  uint8_t cnt = 0;
  while (1) {
    if (++cnt == 100) {
      toggleLED0();

      bool st = readButton0();
      if (!bst && st) {
        //sendTestData();
      }

      cnt = 0;
    }
    // emitLedColorSpec();
    emitDev();

    _delay_ms(1);
  }
}

int main() {
  USBCON = 0;
  neopixel_dev();
  return 0;
}