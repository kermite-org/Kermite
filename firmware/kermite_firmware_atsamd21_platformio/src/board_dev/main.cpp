#include <env.h>

#define P_LED0 PA_17

//----------------------------------------------------------------

void blink()
{
  pinMode(P_LED0, OUTPUT);
  while (1)
  {
    digitalWrite(P_LED0, true);
    delay(100);
    digitalWrite(P_LED0, false);
    delay(100);
    processArduinoSerials();
  }
}

//----------------------------------------------------------------

void serialDebugTest()
{
  pinMode(P_LED0, OUTPUT);
  int cnt = 0;
  Serial.printf("start\n");
  while (1)
  {
    digitalWrite(P_LED0, true);
    delay(500);
    digitalWrite(P_LED0, false);
    delay(500);
    Serial.printf("cnt: %d\n", cnt++);
    processArduinoSerials();
  }
}

//----------------------------------------------------------------

void setup()
{
  //blink();
  serialDebugTest();
}
void loop() {}
