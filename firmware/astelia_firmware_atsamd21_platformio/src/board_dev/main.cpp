#include <Arduino.h>
#include <HID-Project.h>
#include <FlashStorage.h>
#include <board_io.h>
#include <KeyMatrixScanner3.h>

void processArduinoSerials()
{
  if (serialEventRun)
  {
    serialEventRun();
  }
}

//----------------------------------------------------------------

void blink()
{
  board_initBoardIo();
  while (1)
  {
    board_turnOnLED0();
    delay(100);
    board_turnOffLED0();
    delay(100);
    processArduinoSerials();
  }
}

//----------------------------------------------------------------

void serialDebugTest()
{
  board_initBoardIo();
  int cnt = 0;
  while (1)
  {
    board_turnOnLED0();
    delay(100);
    board_turnOffLED0();
    delay(100);
    int bt_res = board_readButton0();
    if (bt_res == BT_RES_DOWN_TRIGGER)
    {
      board_turnOnLED1();
      Serial.printf("hello %d\n", cnt++);
      delay(100);
      board_turnOffLED1();
    }
    processArduinoSerials();
  }
}

//----------------------------------------------------------------

void keyboardTest()
{
  board_initBoardIo();
  Keyboard.begin();
  while (1)
  {
    board_turnOnLED0();
    delay(100);
    board_turnOffLED0();
    delay(100);
    int bt_res = board_readButton0();
    if (bt_res == BT_RES_DOWN_TRIGGER)
    {
      Keyboard.press(KEY_A);
    }
    if (bt_res == BT_RES_UP_TRIGGER)
    {
      Keyboard.release(KEY_A);
    }
    board_outputLED1(bt_res > 0);
    processArduinoSerials();
  }
}

//----------------------------------------------------------------
static uint8_t rawHidRcvBuf[64];
static uint8_t rawHidSendBuf[64];

void sendRawHidTestData()
{
  for (uint8_t i = 0; i < sizeof(rawHidSendBuf); i++)
  {
    rawHidSendBuf[i] = i + 100;
  }
  RawHID.write(rawHidSendBuf, sizeof(rawHidSendBuf));
}

void rawHidTest()
{
  board_initBoardIo();
  RawHID.begin(rawHidRcvBuf, sizeof(rawHidRcvBuf));
  while (1)
  {
    board_turnOnLED0();
    delay(100);
    board_turnOffLED0();
    delay(100);
    int bt_res = board_readButton0();
    if (bt_res == BT_RES_DOWN_TRIGGER)
    {
      board_turnOnLED1();
      sendRawHidTestData();
      delay(100);
      board_turnOffLED1();
    }
    processArduinoSerials();
  }
}

//----------------------------------------------------------------

typedef struct
{
  boolean initialized;
  uint16_t count;
  uint16_t numAssignEntries;
  uint16_t assignEntries[1024];
} PersistData;

FlashStorage(persistDataStore, PersistData);

PersistData persistData;

void flashStorageTest()
{
  persistData = persistDataStore.read();
  board_initBoardIo();
  while (1)
  {
    board_turnOnLED0();
    delay(100);
    board_turnOffLED0();
    delay(100);
    int bt_res = board_readButton0();
    if (bt_res == BT_RES_DOWN_TRIGGER)
    {
      board_turnOnLED1();

      persistData.count++;
      Serial.println(persistData.count);
      persistDataStore.write(persistData);

      delay(100);
      board_turnOffLED1();
    }
    processArduinoSerials();
  }
}

//----------------------------------------------------------------

static int gpio_test_pins_out[] = {
    // PA_00, //not defined for feather m0
    // PA_01, //not defined for feather m0
    PA_02,
    PA_03,
    PB_08,
    PB_09,
    PA_04,
    PA_05,
    PA_06, //LED0
    PA_07,
    PA_08,
    PA_09,
    PA_10,
    PA_11,
    PB_10, //LED1
    PB_11,
    PA_12,
    PA_13,
    PA_14,
    PA_15,
    PA_16,
    PA_17,
    PA_18,
    PA_19,
    PA_20,
    PA_21,
    PA_22,
    PA_23,
    //PA_24,  //usb
    //PA_25,  //usb
    PB_22,
    PB_23,
    PA_27,
    PA_28,
    // PA_30,  //swd
    // PA_31,  //swd
    PB_02,
    PB_03,
};

void gpioPortsTest_out()
{
  pinMode(P_LED0, OUTPUT);
  for (int pin : gpio_test_pins_out)
  {
    pinMode(pin, OUTPUT);
  }
  while (1)
  {
    board_turnOnLED0();
    for (int pin : gpio_test_pins_out)
    {
      digitalWrite(pin, HIGH);
    }
    delay(100);
    board_turnOffLED0();
    for (int pin : gpio_test_pins_out)
    {
      digitalWrite(pin, LOW);
    }
    delay(100);
    processArduinoSerials();
  }
}

//----------------------------------------------------------------

static int gpio_test_pins_in[] = {
    // PA_00, //not defined for feather m0
    // PA_01, //not defined for feather m0
    PA_02,
    PA_03,
    PB_08,
    PB_09,
    PA_04,
    PA_05,
    //PA_06, //LED0
    PA_07,
    PA_08,
    PA_09,
    //PA_10,  //LED1
    PA_11,
    PB_10,
    PB_11,
    PA_12,
    PA_13,
    PA_14,
    PA_15,
    PA_16,
    PA_17,
    PA_18,
    PA_19,
    PA_20,
    PA_21,
    PA_22,
    PA_23,
    //PA_24,  //usb
    //PA_25,  //usb
    PB_22,
    PB_23,
    PA_27,
    PA_28,
    // PA_30,  //swd
    // PA_31,  //swd
    PB_02,
    PB_03,
};

void gpioPortsTest_in()
{
  pinMode(P_LED0, OUTPUT);
  pinMode(P_LED1, OUTPUT);
  for (int pin : gpio_test_pins_in)
  {
    pinMode(pin, INPUT_PULLUP);
  }
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
      bool hit = false;
      for (int pin : gpio_test_pins_in)
      {
        if (digitalRead(pin) == LOW)
        {
          hit = true;
        }
      }
      board_outputLED1(hit);
    }

    delay(1);
    processArduinoSerials();
  }
}

//----------------------------------------------------------------

static const int NumRows = 3;
static const int NumColumns = 4;
static const int NumKeys = NumRows * NumColumns;

static const uint8_t RowPins[NumRows] = {PA_12, PA_13, PA_14};
static const uint8_t ColumnPins[NumColumns] = {PA_16, PA_17, PA_18, PA_19};
static int8_t keyStateArray[NumKeys] = {0};

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
      board_outputLED1(hold);
    }
    delay(1);
    processArduinoSerials();
  }
}

//----------------------------------------------------------------

void setup()
{
  //blink();
  //serialDebugTest();
  //keyboardTest();
  //rawHidTest();
  //flashStorageTest();
  //gpioPortsTest_out();
  //gpioPortsTest_in();
  keyMatrixScanDev();
}
void loop() {}

// void sendKeyState(uint8_t keyId, bool isDown)
// {
//   buf[0] = 0x02;
//   buf[1] = 0xFA;
//   buf[2] = 3;
//   buf[3] = 0;
//   buf[4] = 0xF0;
//   buf[5] = keyId;
//   buf[6] = isDown ? 1 : 0;
//   buf[7] = 0xFD;
//   buf[8] = 0x03;

//   Serial.write(buf, sizeof(buf));
// }