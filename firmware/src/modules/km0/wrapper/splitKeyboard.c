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

#ifdef KM0_SPLIT_KEYBOARD__MASTER_SLAVE_DETEMINATION_PIN
static const int pin_masterSlaveDetermination = KM0_SPLIT_KEYBOARD__MASTER_SLAVE_DETEMINATION_PIN;
#else
static const int pin_masterSlaveDetermination = -1;
#endif

#ifndef KM0_KEYBOARD__NUM_SCAN_SLOTS
#error KM0_KEYBOARD__NUM_SCAN_SLOTS is not defined
#endif

#define NumScanSlots KM0_KEYBOARD__NUM_SCAN_SLOTS
#define NumScanSlotsHalf (NumScanSlots >> 1)

//#define NumScanSlotBytesHalf Ceil(NumScanSlotsHalf / 8)
#define NumScanSlotBytesHalf ((NumScanSlotsHalf + 7) >> 3)
#define NumScanSlotBytes (NumScanSlotBytesHalf * 2)

#define SingleWireMaxPacketSizeTmp (NumScanSlotBytesHalf + 1)

#define SingleWireMaxPacketSize (SingleWireMaxPacketSizeTmp > 4 ? SingleWireMaxPacketSizeTmp : 4)

enum {
  SplitOp_MasterOath = 0xA0,             //Master --> Slave
  SplitOp_ScanSlotStatesRequest = 0x40,  //Master --> Slave
  SplitOp_ScanSlotStatesResponse = 0x41, //Masetr <-- Slave
  SplitOp_KeyStateChanged = 0xC0,        //Master --> Slave
  SplitOp_ParameterChanged = 0xC1,       //Master --> Slave
  SplitOp_SlaveAck = 0xF0,               //Master <-- Slave
};

//---------------------------------------------
//variables

//左右間通信用バッファ
static uint8_t sw_txbuf[SingleWireMaxPacketSize] = { 0 };
static uint8_t sw_rxbuf[SingleWireMaxPacketSize] = { 0 };

static bool hasMasterOathReceived = false;

//---------------------------------------------
//masterの状態通知パケットキュー

static uint32_t masterStatePackets_buf[16];
static uint8_t masterStatePackets_wi = 0;
static uint8_t masterStatePackets_ri = 0;

static void enqueueMasterStatePacket(uint8_t op, uint8_t arg1, uint8_t arg2) {
  uint32_t data = (uint32_t)arg2 << 16 | (uint32_t)arg1 << 8 | op;
  masterStatePackets_buf[masterStatePackets_wi] = data;
  masterStatePackets_wi = (masterStatePackets_wi + 1) & 15;
}

static uint32_t popMasterStatePacket() {
  uint32_t data = masterStatePackets_buf[masterStatePackets_ri];
  if (data != 0) {
    masterStatePackets_buf[masterStatePackets_ri] = 0;
    masterStatePackets_ri = (masterStatePackets_ri + 1) & 15;
    return data;
  }
  return 0;
}

static uint32_t peekMasterStatePacket() {
  return masterStatePackets_buf[masterStatePackets_ri];
}

static void shiftMasterStatePacket() {
  masterStatePackets_buf[masterStatePackets_ri] = 0;
  masterStatePackets_ri = (masterStatePackets_ri + 1) & 15;
}

//---------------------------------------------
//master

//反対側のコントローラからキー状態を受け取る処理
static void pullAltSideKeyStates() {
  sw_txbuf[0] = SplitOp_ScanSlotStatesRequest;
  boardLink_writeTxBuffer(sw_txbuf, 1); //キー状態要求パケットを送信
  boardLink_exchangeFramesBlocking();
  uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);

  if (sz > 0) {
    uint8_t cmd = sw_rxbuf[0];
    if (cmd == SplitOp_ScanSlotStatesResponse && sz == 1 + NumScanSlotBytesHalf) {
      uint8_t *payloadBytes = sw_rxbuf + 1;
      //子-->親, キー状態応答パケット受信, 子のキー状態を受け取り保持
      uint8_t *nextScanSlotStateFlags = keyboardMain_getNextScanSlotStateFlags();
      //nextScanSlotStateFlagsの後ろ半分にslave側のボードのキー状態を格納する
      utils_copyBitFlagsBuf(nextScanSlotStateFlags, NumScanSlotsHalf, payloadBytes, 0, NumScanSlotsHalf);
    }
  }
}

static void swapNextScanSlotStateFlagsFirstLastHalf() {
  uint8_t *nextScanSlotStateFlags = keyboardMain_getNextScanSlotStateFlags();
  for (int i = 0; i < NumScanSlotsHalf; i++) {
    bool a = utils_readArrayedBitFlagsBit(nextScanSlotStateFlags, i);
    bool b = utils_readArrayedBitFlagsBit(nextScanSlotStateFlags, NumScanSlotsHalf + i);
    utils_writeArrayedBitFlagsBit(nextScanSlotStateFlags, i, b);
    utils_writeArrayedBitFlagsBit(nextScanSlotStateFlags, NumScanSlotsHalf + i, a);
  }
}

//masterのキー状態変化やパラメタの変更通知をslaveに送信する処理
static void pushMasterStatePacketOne() {
  //パケットキューからデータを一つ取り出しスレーブに送信, 送信が成功したらキューから除去
  uint32_t data = peekMasterStatePacket();
  if (data) {
    sw_txbuf[0] = data & 0xFF;
    sw_txbuf[1] = data >> 8 & 0xFF;
    sw_txbuf[2] = data >> 16 & 0xFF;
    boardLink_writeTxBuffer(sw_txbuf, 3);
    boardLink_exchangeFramesBlocking();
    uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);
    if (sz == 1 && sw_rxbuf[0] == SplitOp_SlaveAck) {
      shiftMasterStatePacket();
    } else {
      printf("master state NACKed\n");
    }
  }
}

static void handleMasterParameterChanged(uint8_t parameterIndex, uint8_t value) {
  uint8_t pi = parameterIndex;
  if (pi == SystemParameter_KeyHoldIndicatorLed ||
      pi == SystemParameter_HeartbeatLed ||
      pi == SystemParameter_MasterSide ||
      pi == SystemParameter_GlowActive ||
      pi == SystemParameter_GlowColor ||
      pi == SystemParameter_GlowBrightness ||
      pi == SystemParameter_GlowPattern) {
    enqueueMasterStatePacket(SplitOp_ParameterChanged, parameterIndex, value);
  }
}

static void sendInitialParameteresAll() {
  uint8_t *pp = configManager_getParameterValuesRawPointer();
  for (int i = 0; i < NumSystemParameters; i++) {
    handleMasterParameterChanged(i, pp[i]);
  }
}

static void runAsMaster() {
  sendInitialParameteresAll();
  configManager_addParameterChangeListener(handleMasterParameterChanged);
  uint32_t tick = 0;
  while (1) {
    if (tick % 4 == 0) {
      keyboardMain_udpateKeyScanners();
      if (!keyboardMain_exposedState.optionInvertSide) {
        keyboardMain_processKeyInputUpdate(4);
      } else {
        swapNextScanSlotStateFlagsFirstLastHalf(); //nextScanSlotStateFlagsの前半と後半を入れ替える
        keyboardMain_processKeyInputUpdate(4);
        swapNextScanSlotStateFlagsFirstLastHalf(); //戻す
      }
      keyboardMain_updateKeyInidicatorLed();
    }
    if (tick % 4 == 1) {
      pullAltSideKeyStates();
    }
    if (tick % 4 == 2) {
      pushMasterStatePacketOne();
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
static void onRecevierInterruption() {
  uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);
  if (sz > 0) {
    uint8_t cmd = sw_rxbuf[0];

    if (cmd == SplitOp_ScanSlotStatesRequest && sz == 1) {
      //親-->子, キー状態要求パケット受信, キー状態応答パケットを返す
      //子から親に対してキー状態応答パケットを送る
      sw_txbuf[0] = SplitOp_ScanSlotStatesResponse;
      uint8_t *nextScanSlotStateFlags = keyboardMain_getNextScanSlotStateFlags();
      //slave側でnextScanSlotStateFlagsの前半分に入っているキー状態をmasterに送信する
      utils_copyBytes(sw_txbuf + 1, nextScanSlotStateFlags, NumScanSlotBytesHalf);
      boardLink_writeTxBuffer(sw_txbuf, 1 + NumScanSlotBytesHalf);
    }

    if ((cmd == SplitOp_KeyStateChanged || cmd == SplitOp_ParameterChanged) && sz == 3) {
      uint8_t arg1 = sw_rxbuf[1];
      uint8_t arg2 = sw_rxbuf[2];
      enqueueMasterStatePacket(cmd, arg1, arg2);
      sw_txbuf[0] = SplitOp_SlaveAck;
      boardLink_writeTxBuffer(sw_txbuf, 1);
    }
  }
}

static void consumeMasterStatePackets() {
  uint32_t data = popMasterStatePacket();
  if (data) {
    uint8_t op = data & 0xFF;
    uint8_t arg1 = data >> 8 & 0xFF;
    uint8_t arg2 = data >> 16 & 0xFF;
    if (op == SplitOp_KeyStateChanged) {
    }
    if (op == SplitOp_ParameterChanged) {
      uint8_t parameterIndex = arg1;
      uint8_t value = arg2;
      configManager_writeParameter(parameterIndex, value);
    }
  }
}

static void runAsSlave() {
  boardLink_setupSlaveReceiver(onRecevierInterruption);
  keyboardMain_setAsSplitSlave();

  uint32_t tick = 0;
  while (1) {
    if (tick % 4 == 0) {
      keyboardMain_udpateKeyScanners();
      keyboardMain_updateKeyInidicatorLed();
    }
    consumeMasterStatePackets();
    keyboardMain_updateDisplayModules(tick);
    keyboardMain_updateHeartBeatLed(tick);
    delayMs(1);
    tick++;
  }
}

//---------------------------------------------
//detection

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

//単線通信受信割り込みコールバック
static void masterSlaveDetectionMode_onSlaveDataReceived() {
  uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);
  if (sz > 0) {
    uint8_t cmd = sw_rxbuf[0];
    if (cmd == SplitOp_MasterOath && sz == 1) {
      //親-->子, Master確定通知パケット受信
      hasMasterOathReceived = true;
    }
  }
}

//USB接続が確立していない期間の動作
//双方待機し、USB接続が確立すると自分がMasterになり、相手にMaseter確定通知パケットを送る
static bool runMasterSlaveDetectionMode() {
  boardLink_initialize();
  boardLink_setupSlaveReceiver(masterSlaveDetectionMode_onSlaveDataReceived);
  system_enableInterrupts();

  bool isMaster = true;

  while (true) {
    if (usbIoCore_isConnectedToHost()) {
      //Master確定通知パケットを送信
      sw_txbuf[0] = SplitOp_MasterOath;
      boardLink_writeTxBuffer(sw_txbuf, 1);
      boardLink_exchangeFramesBlocking();
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

static bool detemineMasterSlaveByPin() {
  digitalIo_setInputPullup(pin_masterSlaveDetermination);
  delayMs(1);
  return digitalIo_read(pin_masterSlaveDetermination) == 1;
}

//---------------------------------------------

void splitKeyboard_start() {
  system_initializeUserProgram();
  keyboardMain_initialize();
  bool isMaster = false;
  if (pin_masterSlaveDetermination == -1) {
    isMaster = runMasterSlaveDetectionMode();
  } else {
    isMaster = detemineMasterSlaveByPin();
  }
  printf("isMaster:%d\n", isMaster);
  showModeByLedBlinkPattern(isMaster);
  if (isMaster) {
    runAsMaster();
  } else {
    runAsSlave();
  }
}
