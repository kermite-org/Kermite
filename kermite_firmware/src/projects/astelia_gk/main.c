#include "bitOperations.h"
#include "config.h"
#include "configValidator.h"
#include "configuratorServant.h"
#include "debugUart.h"
#include "generalKeyboard.h"
#include "keyMatrixScanner2.h"
#include "keyboardCoreLogic2.h"
#include "pio.h"
#include "usbioCore.h"
#include "utils.h"
#include <avr/interrupt.h>
#include <avr/io.h>
#include <avr/pgmspace.h>
#include <stdio.h>
#include <util/delay.h>

#define NumRows GK_NUM_ROWS
#define NumColumns GK_NUM_COLUMNS
#define NumKeySlots (NumRows * NumColumns)

static const uint8_t rowPins[NumRows] = { P_D7, P_E6, P_B4, P_B5, P_B1, P_B3, P_B2, P_B6 };

#define BOARD_REVISION 4

#if BOARD_REVISION == 3
static const uint8_t columnPins[NumColumns] = { P_C6, P_D4, P_F4, P_F5, P_F6, P_F7 };
#elif BOARD_REVISION >= 4
static const uint8_t columnPins[NumColumns] = { P_C6, P_D4, P_F7, P_F6, P_F5, P_F4 };
#endif

#if BOARD_REVISION == 4
// clang-format off
static const int8_t keySlotIndexToKeyIndexMap[NumKeySlots] PROGMEM = {
  //right
  24, 25, 26, 27, 28, 29,
  30, 31, 32, 33, 34, 35,
  36, 37, 38, 39, 40, 41,
  42, 43, 44, 45, 46, 47,
  //left
   0,  1,  2,  3,  4,  5, 
   6,  7,  8,  9, 10, 11, 
  12, 13, 14, 15, 16, 17, 
  18, 19, 20, 21, 22, 23,
};
// clang-format on
#else
// clang-format off
static const int8_t keySlotIndexToKeyIndexMap[NumKeySlots] PROGMEM = {
  //left
   0,  1,  2,  3,  4,  5, 
   6,  7,  8,  9, 10, 11, 
  12, 13, 14, 15, 16, 17, 
  18, 19, 20, 21, 22, 23,
  //right
  24, 25, 26, 27, 28, 29,
  30, 31, 32, 33, 34, 35,
  36, 37, 38, 39, 40, 41,
  42, 43, 44, 45, 46, 47,
};
// clang-format on

#endif

int main() {
  generalKeyboard_useOnboardLeds();
  generalKeyboard_useDebugUART(38400);
  generalKeyboard_setup(rowPins, columnPins, keySlotIndexToKeyIndexMap);
  generalKeyboard_start();
  return 0;
}
