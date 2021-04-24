#include "debug_uart.h"
#include "dio.h"
#include "km0/common/bitOperations.h"
#include <avr/io.h>
#include <avr/pgmspace.h>
#include <stdio.h>
#include <util/delay.h>

//---------------------------------------------
//env

#define pin_LED0 P_F4
#define pin_LED1 P_F5

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

//---------------------------------------------

#define NumRows 3
#define NumColumns 4

#define NumKeys (NumRows * NumColumns)

const uint8_t row_pins[NumRows] PROGMEM = { P_C6, P_D7, P_E6 };
const uint8_t col_pins[NumColumns] PROGMEM = { P_F6, P_F7, P_B1, P_B3 };

uint8_t rowScanValues[NumRows];
uint8_t keyStateFlags[NumRows];

void keyMatrix_init() {
  for (uint8_t i = 0; i < NumRows; i++) {
    uint8_t rowPin = pgm_read_byte(&row_pins[i]);
    dio_setOutput(rowPin);
    dio_setHigh(rowPin);
  }
  for (uint8_t i = 0; i < NumColumns; i++) {
    uint8_t colPin = pgm_read_byte(&col_pins[i]);
    dio_setInputPullup(colPin);
  }
  for (uint8_t i = 0; i < NumRows; i++) {
    rowScanValues[i] = 0;
    keyStateFlags[i] = 0;
  }
}

void keyMatrix_update() {

  for (uint8_t i = 0; i < NumRows; i++) {
    uint8_t rowPin = pgm_read_byte(&row_pins[i]);
    dio_setLow(rowPin);
    uint8_t rowValue = 0;
    for (uint8_t j = 0; j < NumColumns; j++) {
      uint8_t columnPin = pgm_read_byte(&col_pins[j]);
      bit_spec(rowValue, j, dio_read(columnPin) == 0);
    }
    rowScanValues[i] = rowValue;
    dio_setHigh(rowPin);
  }

  // for (uint8_t i = 0; i < NumRows; i++) {
  //   for (int8_t j = 7; j >= 0; j--) {
  //     printf("%d", bit_read(rowScanValues[i], j));
  //   }
  //   printf(" ");
  // }
  // printf("\n");

#if 1
  for (uint8_t i = 0; i < NumRows; i++) {
    for (uint8_t j = 0; j < NumColumns; j++) {
      uint8_t k = i * NumColumns + j;
      bool curr = bit_read(keyStateFlags[i], j);
      bool next = bit_is_on(rowScanValues[i], j);
      if (!curr && next) {
        printf("keydown %d\n", k);
      }
      if (curr && !next) {
        printf("keyup %d\n", k);
      }
      bit_spec(keyStateFlags[i], j, next);
    }
  }
#else

  for (uint8_t k = 0; k < NumKeys; k++) {
    uint8_t i = k / NumColumns;
    uint8_t j = k % NumColumns;
    uint8_t curr = bit_read(keyStateFlags[i], j);
    uint8_t next = bit_is_on(rowScanValues[i], j);
    if (!curr && next) {
      printf("keydown %d\n", k);
    }
    if (curr && !next) {
      printf("keyup %d\n", k);
    }
    bit_spec(keyStateFlags[i], j, next);
  }
#endif
}

bool isSomePressed() {
  for (uint8_t i = 0; i < NumRows; i++) {
    if (keyStateFlags[i] != 0) {
      return true;
    }
  }
  return false;
}

//---------------------------------------------

void keyMatrixScan_devEntry() {
  initDebugUART(38400);
  printf("start\n");
  initLEDs();

  keyMatrix_init();

  uint8_t cnt = 0;
  while (1) {
    cnt++;
    if (cnt % 10 == 0) {
      keyMatrix_update();
      outputLED1(isSomePressed());
    }
    if (cnt % 100 == 0) {
      toggleLED0();
    }
    _delay_ms(1);
  }
}

int main() {
  USBCON = 0;
  keyMatrixScan_devEntry();
  return 0;
}