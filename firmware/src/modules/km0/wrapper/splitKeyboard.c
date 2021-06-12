#include "splitKeyboard.h"
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
#include <stdio.h>

//---------------------------------------------
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
};

//---------------------------------------------
//variables

//左右間通信用バッファ
static uint8_t sw_txbuf[SingleWireMaxPacketSize] = { 0 };
static uint8_t sw_rxbuf[SingleWireMaxPacketSize] = { 0 };

static bool hasMasterOathReceived = false;

static bool isSlaveExists = false;

//---------------------------------------------
//masterの状態通知パケットキュー

#define MasterStatePacketBufferCapacity 8
#define MasterStatePacketBufferIndexMask (MasterStatePacketBufferCapacity - 1)

static uint32_t masterStatePackets_buf[MasterStatePacketBufferCapacity];
static uint8_t masterStatePackets_wi = 0;
static uint8_t masterStatePackets_ri = 0;
static uint8_t masterStatePackets_n = 0;

static void enqueueMasterStatePacket(uint8_t op, uint8_t arg1, uint8_t arg2) {
  if (masterStatePackets_n < MasterStatePacketBufferCapacity) {
    uint32_t data = (uint32_t)arg2 << 16 | (uint32_t)arg1 << 8 | op;
    masterStatePackets_buf[masterStatePackets_wi] = data;
    masterStatePackets_wi = (masterStatePackets_wi + 1) & MasterStatePacketBufferIndexMask;
    masterStatePackets_n++;
  } else {
    printf("buffer is full, cannot enqueue master state packet\n");
  }
}

static uint32_t popMasterStatePacket() {
  uint32_t data = masterStatePackets_buf[masterStatePackets_ri];
  if (data != 0) {
    masterStatePackets_buf[masterStatePackets_ri] = 0;
    masterStatePackets_ri = (masterStatePackets_ri + 1) & MasterStatePacketBufferIndexMask;
    masterStatePackets_n--;
    return data;
  }
  return 0;
}

static uint32_t peekMasterStatePacket() {
  return masterStatePackets_buf[masterStatePackets_ri];
}

static void shiftMasterStatePacket() {
  masterStatePackets_buf[masterStatePackets_ri] = 0;
  masterStatePackets_ri = (masterStatePackets_ri + 1) & MasterStatePacketBufferIndexMask;
  masterStatePackets_n--;
}

//---------------------------------------------
//master

//反対側のコントローラからキー状態を受け取る処理
static void master_pullAltSideKeyStates() {
  if (!isSlaveExists) {
    return;
  }
  sw_txbuf[0] = SplitOp_InputScanSlotStatesRequest;
  boardLink_writeTxBuffer(sw_txbuf, 1); //キー状態要求パケットを送信
  boardLink_exchangeFramesBlocking();
  uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);

  if (sz > 0) {
    uint8_t cmd = sw_rxbuf[0];
    if (cmd == SplitOp_InputScanSlotStatesResponse && sz == 1 + NumScanSlotBytesHalf) {
      uint8_t *payloadBytes = sw_rxbuf + 1;
      //子-->親, キー状態応答パケット受信, 子のキー状態を受け取り保持
      uint8_t *inputScanSlotFlags = keyboardMain_getInputScanSlotFlags();
      //inputScanSlotFlagsの後ろ半分にslave側のボードのキー状態を格納する
      utils_copyBitFlagsBuf(inputScanSlotFlags, NumScanSlotsHalf, payloadBytes, 0, NumScanSlotsHalf);
    }
  }
}

//masterのキー状態変化やパラメタの変更通知をslaveに送信する処理
static void master_pushMasterStatePacketOne() {
  if (!isSlaveExists) {
    return;
  }
  //パケットキューからデータを一つ取り出しスレーブに送信, 送信が成功したらキューから除去
  uint32_t data = peekMasterStatePacket();
  if (data) {
    sw_txbuf[0] = data & 0xFF;
    sw_txbuf[1] = data >> 8 & 0xFF;
    sw_txbuf[2] = data >> 16 & 0xFF;
    boardLink_writeTxBuffer(sw_txbuf, 3);
    boardLink_exchangeFramesBlocking();
    uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);

    shiftMasterStatePacket();
    if (sz == 1 && sw_rxbuf[0] == SplitOp_SlaveAck) {
    } else {
      // printf("failed to send master state packet, queued:%d\n", masterStatePackets_n);
    }
  }
}

static void master_handleMasterParameterChanged(uint8_t parameterIndex, uint8_t value) {
  uint8_t pi = parameterIndex;
  if (pi == SystemParameter_KeyHoldIndicatorLed ||
      pi == SystemParameter_HeartbeatLed ||
      pi == SystemParameter_MasterSide ||
      pi == SystemParameter_GlowActive ||
      pi == SystemParameter_GlowColor ||
      pi == SystemParameter_GlowBrightness ||
      pi == SystemParameter_GlowPattern) {
    enqueueMasterStatePacket(SplitOp_MasterParameterChanged, parameterIndex, value);
  }
}

static void master_sendInitialParameteresAll() {
  uint8_t *pp = configManager_getParameterValuesRawPointer();
  for (int i = 0; i < NumSystemParameters; i++) {
    master_handleMasterParameterChanged(i, pp[i]);
  }
}

static void master_handleMasterKeySlotStateChanged(uint8_t slotIndex, bool isDown) {
  enqueueMasterStatePacket(SplitOp_MasterScanSlotStateChanged, slotIndex, isDown);
}

static void master_start() {
  printf("isSlaveExists:%d\n", isSlaveExists);
  master_sendInitialParameteresAll();
  keyboardMain_setKeySlotStateChangedCallback(master_handleMasterKeySlotStateChanged);
  configManager_addParameterChangeListener(master_handleMasterParameterChanged);
  uint32_t tick = 0;
  while (1) {
    if (tick % 4 == 0) {
      keyboardMain_udpateKeyScanners();
      keyboardMain_processKeyInputUpdate(4);
      keyboardMain_updateKeyInidicatorLed();
    }
    if (tick % 4 == 1) {
      master_pullAltSideKeyStates();
    }
    if (tick % 4 == 2) {
      master_pushMasterStatePacketOne();
    }
    keyboardMain_updateDisplayModules(tick);
    keyboardMain_updateHeartBeatLed(tick);
    keyboardMain_processUpdate();
    delayMs(1);
    tick++;
  }
}

//---------------------------------------------
//slave

//単線通信の受信割り込みコールバック
static void slave_onRecevierInterruption() {
  uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);
  if (sz > 0) {
    uint8_t cmd = sw_rxbuf[0];

    if (cmd == SplitOp_InputScanSlotStatesRequest && sz == 1) {
      //親-->子, キー状態要求パケット受信, キー状態応答パケットを返す
      //子から親に対してキー状態応答パケットを送る
      sw_txbuf[0] = SplitOp_InputScanSlotStatesResponse;
      uint8_t *inputScanSlotFlags = keyboardMain_getInputScanSlotFlags();
      //slave側でnextScanSlotStateFlagsの前半分に入っているキー状態をmasterに送信する
      utils_copyBytes(sw_txbuf + 1, inputScanSlotFlags, NumScanSlotBytesHalf);
      boardLink_writeTxBuffer(sw_txbuf, 1 + NumScanSlotBytesHalf);
    }

    if ((cmd == SplitOp_MasterScanSlotStateChanged ||
         cmd == SplitOp_MasterParameterChanged) &&
        sz == 3) {
      uint8_t arg1 = sw_rxbuf[1];
      uint8_t arg2 = sw_rxbuf[2];
      enqueueMasterStatePacket(cmd, arg1, arg2);
      sw_txbuf[0] = SplitOp_SlaveAck;
      boardLink_writeTxBuffer(sw_txbuf, 1);
    }
  }
}

static void slave_consumeMasterStatePackets() {
  uint32_t data = popMasterStatePacket();
  if (data) {
    uint8_t op = data & 0xFF;
    uint8_t arg1 = data >> 8 & 0xFF;
    uint8_t arg2 = data >> 16 & 0xFF;
    if (op == SplitOp_MasterScanSlotStateChanged) {
      uint8_t slotIndex = arg1;
      bool isDown = arg2;
      uint8_t *nextScanSlotStateFlags = keyboardMain_getNextScanSlotFlags();
      utils_writeArrayedBitFlagsBit(nextScanSlotStateFlags, slotIndex, isDown);
      // printf("master slot changed %d %d\n", slotIndex, isDown);
    }
    if (op == SplitOp_MasterParameterChanged) {
      uint8_t parameterIndex = arg1;
      uint8_t value = arg2;
      configManager_writeParameter(parameterIndex, value);
    }
  }
}

static void slave_start() {
  boardLink_setupSlaveReceiver(slave_onRecevierInterruption);
  keyboardMain_setAsSplitSlave();

  uint32_t tick = 0;
  while (1) {
    if (tick % 4 == 0) {
      keyboardMain_udpateKeyScanners();
      keyboardMain_updateKeyInidicatorLed();
    }
    slave_consumeMasterStatePackets();
    keyboardMain_updateDisplayModules(tick);
    keyboardMain_updateHeartBeatLed(tick);
    configManager_processUpdate();
    delayMs(1);
    tick++;
  }
}

//---------------------------------------------
//detection

//単線通信受信割り込みコールバック
static void detection_onDataReceivedFromMaster() {
  uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);
  if (sz > 0) {
    uint8_t cmd = sw_rxbuf[0];
    if (cmd == SplitOp_MasterOath && sz == 1) {
      //親-->子, Master確定通知パケット受信
      hasMasterOathReceived = true;
      sw_txbuf[0] = SplitOp_SlaveAck;
      boardLink_writeTxBuffer(sw_txbuf, 1);
    }
  }
}

static void detection_sendMasterOath() {
  //Master確定通知パケットを送信
  sw_txbuf[0] = SplitOp_MasterOath;
  boardLink_writeTxBuffer(sw_txbuf, 1);
  boardLink_exchangeFramesBlocking();
  uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);
  isSlaveExists = sz == 1 && sw_rxbuf[0] == SplitOp_SlaveAck;
}

//USB接続が確立していない期間の動作
//双方待機し、USB接続が確立すると自分がMasterになり、相手にMaseter確定通知パケットを送る
static bool detenction_determineMasterSlaveByUsbConnection() {
  boardLink_initialize();
  boardLink_setupSlaveReceiver(detection_onDataReceivedFromMaster);
  system_enableInterrupts();

  bool isMaster = true;

  while (true) {
    if (usbIoCore_isConnectedToHost()) {
      detection_sendMasterOath();
      isMaster = true;
      break;
    }
    if (hasMasterOathReceived) {
      isMaster = false;
      break;
    }
    usbIoCore_processUpdate();
    delayMs(1);
  }
  boardLink_clearSlaveReceiver();
  return isMaster;
}

static bool detection_detemineMasterSlaveByPin() {
  digitalIo_setInputPullup(pin_masterSlaveDetermination);
  delayMs(1);
  return digitalIo_read(pin_masterSlaveDetermination) == 1;
}

//---------------------------------------------

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
  if (isMaster) {
    //Master/Slave間の接続は必ずあるものとみなす
    isSlaveExists = true;
  }
  showModeByLedBlinkPattern(isMaster);
  if (isMaster) {
    usbIoCore_initialize();
    master_start();
  } else {
    slave_start();
  }
}

static void startDynamicMode() {
  keyboardMain_initialize();
  usbIoCore_initialize();
  bool isMaster = detenction_determineMasterSlaveByUsbConnection();
  printf("isMaster:%d\n", isMaster);
  showModeByLedBlinkPattern(isMaster);
  if (isMaster) {
    master_start();
  } else {
    usbIoCore_deInit();
    slave_start();
  }
}

void splitKeyboard_start() {
  system_initializeUserProgram();
  if (pin_masterSlaveDetermination != -1) {
    startFixedMode();
  } else {
    startDynamicMode();
  }
}
