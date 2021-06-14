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
  //Masater-->Slave
  SplitOp_MasterScanSlotStateChanged = 0xC0,
  SplitOp_MasterParameterChanged = 0xC1,
  SplitOp_TaskOrder_FlashHeartbeat = 0x91,
  SplitOp_TaskOrder_ScanKeyStates = 0x92,
  SplitOp_TaskOrder_UpdateRgbLeds = 0x93,
  SplitOp_TaskOrder_UpdateOled = 0x94,
  SplitOp_IdleCheck = 0x9F,
  //Master <-- Slave
  SplitOp_SlaveAck = 0xF0,
  SplitOp_SlaveNack = 0xF1,
};

//-------------------------------------------------------
//variables

//左右間通信用バッファ
static uint8_t sw_txbuf[SingleWireMaxPacketSize] = { 0 };
static uint8_t sw_rxbuf[SingleWireMaxPacketSize] = { 0 };

//-------------------------------------------------------
//masterの状態通知パケットキュー

#define MasterStatePacketBufferCapacity 16
#define MasterStatePacketBufferIndexMask (MasterStatePacketBufferCapacity - 1)

static uint32_t masterStatePackets_buf[MasterStatePacketBufferCapacity];
static uint8_t masterStatePackets_wi = 0;
static uint8_t masterStatePackets_ri = 0;
static uint8_t masterStatePackets_cnt = 0;

static void enqueueMasterStatePacket(uint8_t op, uint8_t arg1, uint8_t arg2) {
  if (masterStatePackets_cnt < MasterStatePacketBufferCapacity) {
    uint32_t data = (uint32_t)arg2 << 16 | (uint32_t)arg1 << 8 | op;
    masterStatePackets_buf[masterStatePackets_wi] = data;
    masterStatePackets_wi = (masterStatePackets_wi + 1) & MasterStatePacketBufferIndexMask;
    masterStatePackets_cnt++;
  } else {
    printf("buffer is full, cannot enqueue master state packet\n");
  }
}

static uint32_t popMasterStatePacket() {
  if (masterStatePackets_cnt > 0) {
    uint32_t data = masterStatePackets_buf[masterStatePackets_ri];
    masterStatePackets_buf[masterStatePackets_ri] = 0;
    masterStatePackets_ri = (masterStatePackets_ri + 1) & MasterStatePacketBufferIndexMask;
    masterStatePackets_cnt--;
    return data;
  }
  return 0;
}

static uint32_t peekMasterStatePacket() {
  return masterStatePackets_buf[masterStatePackets_ri];
}

static void shiftMasterStatePacket() {
  if (masterStatePackets_cnt > 0) {
    masterStatePackets_buf[masterStatePackets_ri] = 0;
    masterStatePackets_ri = (masterStatePackets_ri + 1) & MasterStatePacketBufferIndexMask;
    masterStatePackets_cnt--;
  }
}

//-------------------------------------------------------
//master

static bool isSlaveActive = false;

static void master_sendSlaveTaskOrder(uint8_t op) {
  sw_txbuf[0] = op;
  boardLink_writeTxBuffer(sw_txbuf, 1);
  boardLink_exchangeFramesBlocking();
  uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);
  isSlaveActive = (sz == 1 && sw_rxbuf[0] == SplitOp_SlaveAck);
}

static void master_waitSlaveTaskCompletion() {
  if (!isSlaveActive) {
    return;
  }
  sw_txbuf[0] = SplitOp_IdleCheck;
  delayUs(50);
  uint8_t cnt = 0;
  while (cnt < 100) {
    boardLink_writeTxBuffer(sw_txbuf, 1);
    boardLink_exchangeFramesBlocking();
    uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);
    if (sz == 1 && sw_rxbuf[0] == SplitOp_SlaveAck) {
      break;
    }
    delayUs(500);
    cnt++;
  }
}

//反対側のコントローラからキー状態を受け取る処理
static void master_pullAltSideKeyStates() {
  if (!isSlaveActive) {
    return;
  }
  sw_txbuf[0] = SplitOp_InputScanSlotStatesRequest;
  boardLink_writeTxBuffer(sw_txbuf, 1); //キー状態要求パケットを送信
  boardLink_exchangeFramesBlocking();
  uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);

  if (sz == 1 + NumScanSlotBytesHalf && sw_rxbuf[0] == SplitOp_InputScanSlotStatesResponse) {
    uint8_t *payloadBytes = sw_rxbuf + 1;
    //子-->親, キー状態応答パケット受信, 子のキー状態を受け取り保持
    uint8_t *inputScanSlotFlags = keyboardMain_getInputScanSlotFlags();
    //inputScanSlotFlagsの後ろ半分にslave側のボードのキー状態を格納する
    utils_copyBitFlagsBuf(inputScanSlotFlags, NumScanSlotsHalf, payloadBytes, 0, NumScanSlotsHalf);
  } else {
    printf("no keystate response from slave\n");
  }
}

//masterのキー状態変化やパラメタの変更通知をslaveに送信する処理
static void master_pushMasterStatePacketOne() {
  if (!isSlaveActive) {
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

    if (sz == 1 && sw_rxbuf[0] == SplitOp_SlaveAck) {
      shiftMasterStatePacket();
    } else {
      printf("failed to send master state packet\n");
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
  master_sendInitialParameteresAll();
  configManager_addParameterChangeListener(master_handleMasterParameterChanged);
  keyboardMain_setKeySlotStateChangedCallback(master_handleMasterKeySlotStateChanged);

  uint32_t tick = 0;
  while (1) {
    if (tick % 4 == 0) {
      master_sendSlaveTaskOrder(SplitOp_TaskOrder_ScanKeyStates);
      keyboardMain_udpateKeyScanners();
      keyboardMain_processKeyInputUpdate(15);
      keyboardMain_updateKeyInidicatorLed();
      master_waitSlaveTaskCompletion();
    }
    if (tick % 4 == 1) {
      master_pullAltSideKeyStates();
    }
    if (tick % 4 == 2) {
      master_pushMasterStatePacketOne();
    }
    if (tick % 40 == 1) {
      master_sendSlaveTaskOrder(SplitOp_TaskOrder_UpdateRgbLeds);
      keyboardMain_updateRgbLightingModules(tick);
      master_waitSlaveTaskCompletion();
    }
    if (tick % 48 == 2) {
      master_sendSlaveTaskOrder(SplitOp_TaskOrder_UpdateOled);
      keyboardMain_updateOledDisplayModule(tick);
      master_waitSlaveTaskCompletion();
    }
    if (tick % 4000 == 3) {
      master_sendSlaveTaskOrder(SplitOp_TaskOrder_FlashHeartbeat);
      keyboardMain_taskFlashHeartbeatLed();
      master_waitSlaveTaskCompletion();
    }
    keyboardMain_processUpdate();
    delayUs(500);
    tick++;
  }
}

//-------------------------------------------------------
//slave

volatile static uint8_t taskOrder = 0;
volatile static bool masterStateReceived = false;

static void slave_respondAck() {
  sw_txbuf[0] = SplitOp_SlaveAck;
  boardLink_writeTxBuffer(sw_txbuf, 1);
}

static void slave_respondNack() {
  sw_txbuf[0] = SplitOp_SlaveNack;
  boardLink_writeTxBuffer(sw_txbuf, 1);
}

//単線通信の受信割り込みコールバック
static void slave_onRecevierInterruption() {
  uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);
  if (sz > 0) {
    uint8_t cmd = sw_rxbuf[0];
    if (cmd == SplitOp_IdleCheck) {
      if (taskOrder != 0) {
        slave_respondNack();
      } else {
        slave_respondAck();
      }
    }
    if (cmd == SplitOp_TaskOrder_FlashHeartbeat ||
        cmd == SplitOp_TaskOrder_ScanKeyStates ||
        cmd == SplitOp_TaskOrder_UpdateRgbLeds ||
        cmd == SplitOp_TaskOrder_UpdateOled) {
      taskOrder = cmd;
      slave_respondAck();
    }

    if (cmd == SplitOp_InputScanSlotStatesRequest) {
      //親-->子, キー状態要求パケット受信, キー状態応答パケットを返す
      //子から親に対してキー状態応答パケットを送る
      sw_txbuf[0] = SplitOp_InputScanSlotStatesResponse;
      uint8_t *inputScanSlotFlags = keyboardMain_getInputScanSlotFlags();
      //slave側でnextScanSlotStateFlagsの前半分に入っているキー状態をmasterに送信する
      utils_copyBytes(sw_txbuf + 1, inputScanSlotFlags, NumScanSlotBytesHalf);
      boardLink_writeTxBuffer(sw_txbuf, 1 + NumScanSlotBytesHalf);
    }

    if (cmd == SplitOp_MasterScanSlotStateChanged ||
        cmd == SplitOp_MasterParameterChanged) {
      uint8_t arg1 = sw_rxbuf[1];
      uint8_t arg2 = sw_rxbuf[2];
      enqueueMasterStatePacket(cmd, arg1, arg2);
      masterStateReceived = true;
      slave_respondAck();
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
      // printf("master parameter changed %d %d\n", parameterIndex, value);
      configManager_writeParameter(parameterIndex, value);
      configManager_processUpdateNoSave();
    }
  }
}

static void slave_start() {
  keyboardMain_setAsSplitSlave();
  boardLink_setupSlaveReceiver(slave_onRecevierInterruption);

  while (1) {
    if (taskOrder == SplitOp_TaskOrder_FlashHeartbeat) {
      keyboardMain_taskFlashHeartbeatLed();
      taskOrder = 0;
    }
    if (taskOrder == SplitOp_TaskOrder_ScanKeyStates) {
      keyboardMain_udpateKeyScanners();
      keyboardMain_updateKeyInidicatorLed();
      taskOrder = 0;
    }
    if (taskOrder == SplitOp_TaskOrder_UpdateRgbLeds) {
      keyboardMain_updateRgbLightingModules(0);
      taskOrder = 0;
    }
    if (taskOrder == SplitOp_TaskOrder_UpdateOled) {
      keyboardMain_updateOledDisplayModule(0);
      taskOrder = 0;
    }
    if (masterStateReceived) {
      slave_consumeMasterStatePackets();
      masterStateReceived = false;
    }
    delayUs(10);
  }
}

//-------------------------------------------------------
//detection

volatile static bool hasMasterOathReceived = false;

//単線通信受信割り込みコールバック
static void detection_onDataReceivedFromMaster() {
  uint8_t sz = boardLink_readRxBuffer(sw_rxbuf, SingleWireMaxPacketSize);
  if (sz == 1 && sw_rxbuf[0] == SplitOp_MasterOath) {
    //Master確定通知パケット受信
    hasMasterOathReceived = true;
    sw_txbuf[0] = SplitOp_SlaveAck;
    boardLink_writeTxBuffer(sw_txbuf, 1);
  }
}

static void detection_sendMasterOath() {
  //Master確定通知パケットを送信
  sw_txbuf[0] = SplitOp_MasterOath;
  boardLink_writeTxBuffer(sw_txbuf, 1);
  boardLink_exchangeFramesBlocking();
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

//-------------------------------------------------------

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
