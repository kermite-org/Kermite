#include "env.h"
#include <Arduino.h>

void processArduinoSerials()
{
  if (serialEventRun)
  {
    serialEventRun();
  }
}
