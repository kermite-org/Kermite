#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "km0/device/boardIo.h"
#include "km0/device/boardLink.h"
#include "km0/device/digitalIo.h"
#include "km0/device/system.h"
#include "km0/device/usbIoCore.h"
#include "km0/kernel/commandDefinitions.h"
#include "km0/kernel/configManager.h"
#include "km0/kernel/keyboardMainInternal.h"
#include "splitKeyboard.h"
#include <stdio.h>

//-------------------------------------------------------
//definitions

#ifdef KM0_SPLIT_KEYBOARD__DEBUG_MASTER_SLAVE_DETEMINATION_PIN
static const int pin_masterSlaveDetermination = KM0_SPLIT_KEYBOARD__DEBUG_MASTER_SLAVE_DETEMINATION_PIN;
#else
static const int pin_masterSlaveDetermination = -1;
#endif

#ifndef KM0_KEYBOARD__NUM_SCAN_SLOTS
#error KM0_KEYBOARD__NUM_SCAN_SLOTS is not defined
#endif

#define NumScanSlots KM0_KEYBOARD__NUM_SCAN_SLOTS
#define NumScanSlotsHalf (NumScanSlots >> 1)
// #define NumScanSlotBytesHalf Ceil(NumScanSlotsHalf / 8)
#define NumScanSlotBytesHalf ((NumScanSlotsHalf + 7) >> 3)
#define NumScanSlotBytes (NumScanSlotBytesHalf * 2)
#define SingleWireMaxPacketSizeTmp (NumScanSlotBytesHalf + 1)
#define SingleWireMaxPacketSize (SingleWireMaxPacketSizeTmp > 4 ? SingleWireMaxPacketSizeTmp : 4)

enum {
  SplitOp_MasterOath = 0xA0,                  //Master --> Slave
  SplitOp_InputScanSlotStatesRequest = 0x40,  //Master --> Slave
  SplitOp_InputScanSlotStatesResponse = 0x41, //Masetr <-- Slave
  SplitOp_MasterScanSlotStateChanged = 0xC0,  //Master --> Slave
  SplitOp_MasterParameterChanged = 0xC1,      //Master --> Slave
  SplitOp_SlaveAck = 0xF0,                    //Master <-- Slave
  SplitOp_Sync_Heartbeat = 0x90
};

//---------------------------------------------
//variables

//左右間通信用バッファ
static uint8_t sw_txbuf[SingleWireMaxPacketSize] = { 0 };
static uint8_t sw_rxbuf[SingleWireMaxPacketSize] = { 0 };

//-------------------------------------------------------

static uint8_t heatbeatLed_tick = 0;

static void heartbeatLed_update() {
  if (heatbeatLed_tick > 0) {
    heatbeatLed_tick--;
    if (heatbeatLed_tick == 0) {
      boardIo_writeLed1(false);
    }
  }
}

static void heartbeatLed_flash() {
  boardIo_writeLed1(true);
  heatbeatLed_tick = 4;
}

//-------------------------------------------------------
//masater

static bool isConnectionActive = false;

static void master_sendSyncSignal(uint8_t op) {
  sw_txbuf[0] = op;
  boardLink_writeTxBuffer(sw_txbuf, 1);
  boardLink_exchangeFramesBlocking();
  uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);
  if (sz == 1 && sw_rxbuf[0] == SplitOp_SlaveAck) {
  }
}

static void master_start() {
  isConnectionActive = true;
  uint32_t tick = 0;
  while (1) {
    if (tick % 4000 == 0) {
      master_sendSyncSignal(SplitOp_Sync_Heartbeat);
      heartbeatLed_flash();
    }
    heartbeatLed_update();
    delayMs(1);
    tick++;
  }
}

//-------------------------------------------------------
//slave

volatile static bool flagSyncHeartbeat = false;

static void slave_respondAck() {
  sw_txbuf[0] = SplitOp_SlaveAck;
  boardLink_writeTxBuffer(sw_txbuf, 1);
}

//単線通信の受信割り込みコールバック
static void slave_onRecevierInterruption() {
  uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);
  if (sz > 0) {
    uint8_t cmd = sw_rxbuf[0];
    if (cmd == SplitOp_Sync_Heartbeat) {
      flagSyncHeartbeat = true;
      slave_respondAck();
    }
  }
}

static void slave_start() {
  keyboardMain_setAsSplitSlave();
  boardLink_setupSlaveReceiver(slave_onRecevierInterruption);

  while (1) {
    if (flagSyncHeartbeat) {
      flagSyncHeartbeat = false;
      heartbeatLed_flash();
    }
    heartbeatLed_update();
    delayMs(1);
  }
}

//-------------------------------------------------------

static bool detection_detemineMasterSlaveByPin() {
  digitalIo_setInputPullup(pin_masterSlaveDetermination);
  delayMs(1);
  return digitalIo_read(pin_masterSlaveDetermination) == 1;
}

//master/slave確定後にどちらになったかをLEDで表示
static void showModeByLedBlinkPattern(bool isMaster) {
  if (isMaster) {
    //masterの場合高速に4回点滅
    for (uint8_t i = 0; i < 4; i++) {
      boardIo_writeLed1(true);
      delayMs(2);
      boardIo_writeLed1(false);
      delayMs(100);
    }
  } else {
    //slaveの場合長く1回点灯
    boardIo_writeLed1(true);
    delayMs(500);
    boardIo_writeLed1(false);
  }
}

//ピンによる判定でMaster/Slaveを固定して動作させるモード
//主にデバッグ用途で使用
static void startFixedMode() {
  printf("master/slave fixed mode\n");
  keyboardMain_initialize();
  bool isMaster = detection_detemineMasterSlaveByPin();
  printf("isMaster:%d\n", isMaster);
  showModeByLedBlinkPattern(isMaster);

  boardLink_initialize();
  system_enableInterrupts();
  if (isMaster) {
    usbIoCore_initialize();
    master_start();
  } else {
    slave_start();
  }
}

void splitKeyboard_start() {
  system_initializeUserProgram();
  if (pin_masterSlaveDetermination != -1) {
    startFixedMode();
  } else {
    // startDynamicMode();
  }
}
