#include <Arduino.h>
#include <HID-Project.h>
#include <FlashStorage.h>
#include <KeyMatrixScanner3.h>
#include <env.h>
#include <board_io_xiao.h>

/*
cx30, seeed xiao pinsout
col4 PA02 D0 1     14  5V
col3 PA04 D1 2     13 GND
col2 PA10 D2 3     12 3V3
col1 PA11 D3 4     11 D10 PA06 col0
row0 PA08 D4 5     10  D9 PA05 row3
row1 PA09 D5 6      9  D8 PA07 row4
row2 PB08 D6 7      8  D7 PB09 row5
*/

//----------------------------------------------------------------

static const int NumRows = 6;
static const int NumColumns = 5;
static const uint8_t RowPins[NumRows] = {PA_08, PA_09, PB_08, PA_05, PA_07, PB_09};
static const uint8_t ColumnPins[NumColumns] = {PA_06, PA_11, PA_10, PA_04, PA_02};

static const int NumKeys = NumRows * NumColumns;
static int8_t keyStateArray[NumKeys] = {0};

static uint8_t rawHidRcvBuf[64];
static uint8_t rawHidSendBuf[64];

void sendKeyStateEvent(uint8_t keyIndex, bool state)
{
  uint8_t *buf = rawHidSendBuf;
  buf[0] = 0xE0;
  buf[1] = 0x90;
  buf[2] = keyIndex;
  buf[3] = state ? 1 : 0;
  RawHID.write(rawHidSendBuf, sizeof(rawHidSendBuf));
}

void keyMatrixScanDev()
{
  board_initBoardIo();
  keyMatrixScanner_initialize(NumRows, NumColumns, RowPins, ColumnPins, keyStateArray);
  RawHID.begin(rawHidRcvBuf, sizeof(rawHidRcvBuf));

  int cnt = 0;
  while (1)
  {
    cnt++;
    if (cnt % 100 == 0)
    {
      board_toggleLED0();
    }
    if (cnt % 10 == 0)
    {
      keyMatrixScanner_update();

      bool hold = false;
      for (int i = 0; i < NumKeys; i++)
      {
        int keyState = keyStateArray[i];
        if (keyState == KEY_STATE_DOWN_TRIGGER)
        {
          Serial.printf("keydown %d\n", i);
          sendKeyStateEvent(i, true);
        }
        else if (keyState == KEY_STATE_UP_TRIGGER)
        {
          Serial.printf("keyup %d\n", i);
          sendKeyStateEvent(i, false);
        }

        if (keyState > 0)
        {
          hold = true;
        }
      }
      // board_outputLED1(hold);
    }
    delay(1);
    processArduinoSerials();
  }
}

void setup()
{
  keyMatrixScanDev();
}
void loop() {}
