#ifndef __BOARD_H__
#define __BOARD_H__

#include <env.h>

#define P_LED0 PA_17

void board_initBoardIo();
void board_turnOnLED0();
void board_turnOffLED0();
void board_toggleLED0();
void board_outputLED0(bool state);

#endif