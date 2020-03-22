#include <board_io_xiao.h>
#include <Arduino.h>

void board_initBoardIo()
{
  pinMode(P_LED0, OUTPUT);
}

void board_turnOnLED0()
{
  digitalWrite(P_LED0, true);
}

void board_turnOffLED0()
{
  digitalWrite(P_LED0, false);
}

void board_toggleLED0()
{
  digitalWrite(P_LED0, !digitalRead(P_LED0));
}

void board_outputLED0(bool state)
{
  digitalWrite(P_LED0, state);
}
