#include "km0/common/utils.h"
#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/digitalIo.h"
#include "km0/deviceIo/interLink.h"
#include "km0/deviceIo/system.h"
#include <stdio.h>

//board RPi Pico

//単一デバイスで単線往復送受信実験
//slave側ピン変化割り込みハンドラで送受信処理を実行
//モジュール化
//master,slaveを別デバイスで実験

//GP14: master/slave判定, 内部pullup, GNDにつないだ場合master

//master
//GP14 master/slave判定 <---- GND
//GP20 信号線 <---> slave GP20 ----> ロジアナch0
//GP21 受信タイミングモニタ ----> ロジアナch2
//GP0 デバッグUART出力 ----> USB-UART ----> PC

//slave
//GP14 master/slave判定 <---- NC (内部pullupでHI)
//GP20 信号線 <---> master GP20
//GP21 受信タイミングモニタ ----> ロジアナch1

//----------------------------------------
//led

void initLed() {
  digitalIo_setOutput(GP25);
}

void toggleLed() {
  digitalIo_toggle(GP25);
}

//----------------------------------------

uint8_t txbuf[10];
uint8_t rxbuf[10];

//----------------------------------------
//master

void processSendData() {
  txbuf[0] = 0x12;
  txbuf[1] = 0x34;

  interLink_writeTxBuffer(txbuf, 2);
  interLink_exchangeFramesBlocking();
  int sz = interLink_readRxBuffer(rxbuf, 10);
  printf("received @master: ");
  utils_debugShowBytes(rxbuf, sz);
}

void processSendData2() {
  for (int i = 0; i < 10; i++) {
    txbuf[i] = 0x10 * i + i;
  }
  interLink_writeTxBuffer(txbuf, 10);
  interLink_exchangeFramesBlocking();
  int sz = interLink_readRxBuffer(rxbuf, 10);
  printf("received @master: ");
  utils_debugShowBytes(rxbuf, sz);
}

void runAsMaster() {
  interLink_initialize();
  delayMs(100);

  while (true) {
    processSendData();
    // processSendData2();
    toggleLed();
    delayMs(1000);
  }
}

//----------------------------------------
//slave

int receivedCount = -1;

void onRecieverInterrupted() {
  receivedCount = interLink_readRxBuffer(rxbuf, 10);
  //echo back
  for (int i = 0; i < receivedCount; i++) {
    txbuf[i] = rxbuf[i] + 1;
  }
  interLink_writeTxBuffer(txbuf, receivedCount);
}

void runAsSlave() {
  interLink_initialize();
  interLink_setupSlaveReceiver(onRecieverInterrupted);
  while (true) {
    if (receivedCount > 0) {
      printf("received @slave: ");
      utils_debugShowBytes(rxbuf, receivedCount);
      receivedCount = -1;
    }
    toggleLed();
    delayMs(1000);
  }
}

//----------------------------------------
//entry

int main() {
  debugUart_initialize(115200);
  initLed();
  digitalIo_setInputPullup(GP14);
  delayMs(1);
  bool isMaster = digitalIo_read(GP14) == 0;
  printf("mode: %s\n", isMaster ? "master" : "slave");

  if (isMaster) {
    runAsMaster();
  } else {
    runAsSlave();
  }
}
