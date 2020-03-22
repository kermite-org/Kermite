#include "xpio.h"
#include <Arduino.h>

void pio_setPinModeOutput(uint32_t pin)
{
  pinMode(pin, OUTPUT);
}

void pio_setPinModeInputPullUp(uint32_t pin)
{
  pinMode(pin, INPUT_PULLUP);
}

int pio_getPinLevel(uint32_t pin)
{
  return digitalRead(pin);
}

void pio_setPinLevel(uint32_t pin, bool level)
{
  digitalWrite(pin, level);
}

void pio_setPinLevelHigh(uint32_t pin)
{
  digitalWrite(pin, HIGH);
}

void pio_setPinLevelLow(uint32_t pin)
{
  digitalWrite(pin, LOW);
}
