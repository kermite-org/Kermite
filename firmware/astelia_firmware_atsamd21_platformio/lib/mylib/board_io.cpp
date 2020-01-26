#include "board_io.h"

void board_initBoardIo()
{
  pinMode(P_LED0, OUTPUT);
  pinMode(P_BUTTON0, INPUT_PULLUP);
  pinMode(P_LED1, OUTPUT);
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

void board_turnOnLED1()
{
  digitalWrite(P_LED1, true);
}

void board_turnOffLED1()
{
  digitalWrite(P_LED1, false);
}

void board_toggleLED1()
{
  digitalWrite(P_LED1, !digitalRead(P_LED1));
}

void board_outputLED1(bool state)
{
  digitalWrite(P_LED1, state);
}

int board_readButton0()
{
  static bool pressed = false;

  int res;

  bool newPressed = digitalRead(P_BUTTON0) == LOW;
  if (!pressed && newPressed)
  {
    res = BT_RES_DOWN_TRIGGER;
  }
  else if (pressed && !newPressed)
  {
    res = BT_RES_UP_TRIGGER;
  }
  else if (pressed)
  {
    res = BT_RES_DOWN;
  }
  else
  {
    res = BT_RES_NONE;
  }
  pressed = newPressed;
  return res;
}
