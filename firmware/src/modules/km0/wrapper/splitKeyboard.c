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

#ifndef KM0_KEYBOARD__RIGHTHAND_SCAN_SLOTS_OFFSET
#define KM0_KEYBOARD__RIGHTHAND_SCAN_SLOTS_OFFSET (KM0_KEYBOARD__NUM_SCAN_SLOTS / 2)
#endif

#define _NumScanSlotsAll KM0_KEYBOARD__NUM_SCAN_SLOTS
#define _RighthandScanSlotsOffset KM0_KEYBOARD__RIGHTHAND_SCAN_SLOTS_OFFSET

#define _NumScanSlotsLeft _RighthandScanSlotsOffset
#define _NumScanSlotsRight (_NumScanSlotsAll - _NumScanSlotsLeft)

// #define NumScanSlotBytesLeft Ceil(NumScanSlotsLeft / 8)
#define _NumScanSlotBytesLeft ((_NumScanSlotsLeft + 7) / 8)
#define _NumScanSlotBytesRight ((_NumScanSlotsRight + 7) / 8)

#define NumScanSlotBytesLarger (_NumScanSlotBytesLeft > _NumScanSlotBytesRight ? _NumScanSlotBytesLeft : _NumScanSlotBytesRight)
#define _SingleWireMaxPacketSizeTmp (NumScanSlotBytesLarger + 1)
#define SingleWireMaxPacketSize (_SingleWireMaxPacketSizeTmp > 4 ? _SingleWireMaxPacketSizeTmp : 4)

//dynamic overridable values
static uint8_t numScanSlots = _NumScanSlotsAll;
static uint8_t righthandScanSlotsOffset = _RighthandScanSlotsOffset;
static uint8_t numScanSlotsLeft = _NumScanSlotsLeft;
static uint8_t numScanSlotsRight = _NumScanSlotsRight;
static uint8_t numScanSlotBytesLeft = _NumScanSlotBytesLeft;
static uint8_t numScanSlotBytesRight = _NumScanSlotBytesRight;

enum {
  SplitOp_MasterOath = 0xC0,                  //Master --> Slave
  SplitOp_InputScanSlotStatesRequest = 0xC1,  //Master --> Slave
  SplitOp_InputScanSlotStatesResponse = 0xC2, //Masetr <-- Slave
  //Master-->Slave
  SplitOp_TaskOrder_FlashHeartbeat = 0xD1,
  SplitOp_TaskOrder_ScanKeyStates = 0xD2,
  SplitOp_TaskOrder_UpdateRgbLeds = 0xD3,
  SplitOp_TaskOrder_UpdateOled = 0xD4,
  SplitOp_IdleCheck = 0xDF,
  //Master-->Slave
  SplitOp_MasterScanSlotStateChanged = 0xE1,
  SplitOp_MasterParameterChanged = 0xE2,
  //Master <-- Slave
  SplitOp_SlaveAck = 0xF0,
  SplitOp_SlaveNack = 0xF1,
};

//-------------------------------------------------------
//variables

//左右間通信用バッファ
static uint8_t sw_txbuf[SingleWireMaxPacketSize] = { 0 };
static uint8_t sw_rxbuf[SingleWireMaxPacketSize] = { 0 };

bool isRightHand = false;
void (*boardConfigCallback)(int8_t side) = NULL;

int8_t configuredBoardSide = -1;

//-------------------------------------------------------
//100ms周期のタスク, ステータスLED用

static uint32_t taskHmsNextTimeMs = 0;
static uint32_t taskHmsStep = 0;

static void taskForEach100ms(void (*taskFunc)(uint32_t)) {
  uint32_t timeMs = system_getSystemTimeMs();
  if (timeMs > taskHmsNextTimeMs) {
    taskFunc(taskHmsStep);
    taskHmsStep++;
    taskHmsNextTimeMs = timeMs + 100;
  }
}

//-------------------------------------------------------

static void setBoardSide(int8_t side) {
  if (side != configuredBoardSide) {
    isRightHand = side == 1;
    printf("board side: %s\n", isRightHand ? "RIGHT" : "LEFT");
    if (boardConfigCallback) {
      boardConfigCallback(side);
    }
    configuredBoardSide = side;
  }
}

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

  bool isSlaveRight = !isRightHand;
  uint8_t refSize = (isSlaveRight ? numScanSlotBytesRight : numScanSlotBytesLeft) + 1;

  if (sz == refSize && sw_rxbuf[0] == SplitOp_InputScanSlotStatesResponse) {
    uint8_t *payloadBytes = sw_rxbuf + 1;
    uint8_t *inputScanSlotFlags = keyboardMain_getInputScanSlotFlags();

    if (isSlaveRight) {
      //masterが左手側の場合inputScanSlotFlagsの後半部分にslave側のボードのキー状態を格納する
      utils_copyBitFlagsBuf(inputScanSlotFlags, righthandScanSlotsOffset, payloadBytes, 0, numScanSlotsRight);
    } else {
      //masterが右手側の場合inputScanSlotFlagsの前半部分にslave側のボードのキー状態を格納する
      utils_copyBitFlagsBuf(inputScanSlotFlags, 0, payloadBytes, 0, numScanSlotsLeft);
    }
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

static void master_handleMasterParameterChanged(uint8_t eventType, uint8_t parameterIndex, uint8_t value) {
  if (eventType == ParameterChangeEventType_ChangedAll) {
    configManager_dispatchSingleParameterChangedEventsAll(master_handleMasterParameterChanged);
    return;
  }

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
  if (pi == SystemParameter_MasterSide) {
    setBoardSide(value);
  }
}

static void master_handleMasterKeySlotStateChanged(uint8_t slotIndex, bool isDown) {
  enqueueMasterStatePacket(SplitOp_MasterScanSlotStateChanged, slotIndex, isDown);
}

static void master_setupBoard() {
  uint8_t side = configManager_readParameter(SystemParameter_MasterSide);
  setBoardSide(side);
}

static void master_ledTask(uint32_t step) {
  if (isSlaveActive) {
    //左右間の通信が機能している場合同期して1回ずつ点滅
    if (step % 30 == 0) {
      master_sendSlaveTaskOrder(SplitOp_TaskOrder_FlashHeartbeat);
      keyboardMain_taskFlashHeartbeatLed();
      master_waitSlaveTaskCompletion();
    }
  } else {
    //slaveとの疎通が取れなくなっている場合2回ずつ点滅
    if (step % 30 == 0) {
      keyboardMain_taskFlashHeartbeatLed();
    };
    if (step % 30 == 2) {
      keyboardMain_taskFlashHeartbeatLed();
    };
  }
}

static void master_start() {
  master_setupBoard();
  configManager_dispatchSingleParameterChangedEventsAll(master_handleMasterParameterChanged);
  configManager_addParameterChangeListener(master_handleMasterParameterChanged);
  keyboardMain_setKeySlotStateChangedCallback(master_handleMasterKeySlotStateChanged);

  uint32_t tick = 4;
  while (1) {
    if (tick % 4 == 0) {
      master_sendSlaveTaskOrder(SplitOp_TaskOrder_ScanKeyStates);
      keyboardMain_udpateKeyScanners();
      keyboardMain_processKeyInputUpdate();
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
    if (tick % 100 == 0) {
      keyboardMain_updateHostKeyboardStatusOutputModule();
    }
    taskForEach100ms(master_ledTask);
    keyboardMain_processUpdate();
    delayUs(500);
    tick++;
  }
}

//-------------------------------------------------------
//slave

volatile static uint8_t taskOrder = 0;
volatile static bool masterStateReceived = false;

static uint8_t slaveSendingKeyStateBytes[NumScanSlotBytesLarger] = { 0 };
static uint8_t slaveSendingKeyStateBytesLen = 0;

volatile static uint8_t slavePacketReceivedFromMaster = false;

static void slave_respondAck() {
  sw_txbuf[0] = SplitOp_SlaveAck;
  boardLink_writeTxBuffer(sw_txbuf, 1);
}

static void slave_respondNack() {
  sw_txbuf[0] = SplitOp_SlaveNack;
  boardLink_writeTxBuffer(sw_txbuf, 1);
}

static void slave_prepareKeyStateSendingBytes() {
  uint8_t *inputScanSlotFlags = keyboardMain_getInputScanSlotFlags();
  if (isRightHand) {
    //slaveが右手側の場合inputScanSlotFlagsの後ろ半分にあるキー状態をmasterに送る
    utils_copyBitFlagsBuf(slaveSendingKeyStateBytes, 0, inputScanSlotFlags, righthandScanSlotsOffset, numScanSlotsRight);
    slaveSendingKeyStateBytesLen = numScanSlotBytesRight;
  } else {
    //slaveが左手側の場合inputScanSlotFlagsの前半分にあるキー状態をmasterに送る
    utils_copyBitFlagsBuf(slaveSendingKeyStateBytes, 0, inputScanSlotFlags, 0, numScanSlotsLeft);
    slaveSendingKeyStateBytesLen = numScanSlotBytesLeft;
  }
}

//単線通信の受信割り込みコールバック
static void slave_onReceiverInterruption() {
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
      //masterからslaveへのキー状態要求パケット
      //キー状態応答パケットを返す
      sw_txbuf[0] = SplitOp_InputScanSlotStatesResponse;
      utils_copyBytes(sw_txbuf + 1, slaveSendingKeyStateBytes, slaveSendingKeyStateBytesLen);
      boardLink_writeTxBuffer(sw_txbuf, 1 + slaveSendingKeyStateBytesLen);
    }

    if (cmd == SplitOp_MasterScanSlotStateChanged ||
        cmd == SplitOp_MasterParameterChanged) {
      uint8_t arg1 = sw_rxbuf[1];
      uint8_t arg2 = sw_rxbuf[2];
      enqueueMasterStatePacket(cmd, arg1, arg2);
      masterStateReceived = true;
      slave_respondAck();
    }
    slavePacketReceivedFromMaster = true;
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
      uint8_t *scanSlotStateFlags = keyboardMain_getScanSlotFlags();
      utils_writeArrayedBitFlagsBit(scanSlotStateFlags, slotIndex, isDown);
      // printf("master slot changed %d %d\n", slotIndex, isDown);
    }
    if (op == SplitOp_MasterParameterChanged) {
      uint8_t parameterIndex = arg1;
      uint8_t value = arg2;
      // printf("master parameter changed %d %d\n", parameterIndex, value);
      configManager_writeParameter(parameterIndex, value);
      configManager_processUpdateNoSave();

      if (parameterIndex == SystemParameter_MasterSide) {
        uint8_t masterSide = value;
        uint8_t slaveSide = (masterSide == 0) ? 1 : 0;
        setBoardSide(slaveSide);
      }
    }
  }
}

static void slave_ledTask(uint32_t step) {
  bool isConnected = slavePacketReceivedFromMaster;
  if (!isConnected) {
    //masterからの通信が途絶している場合2回ずつ点滅
    if (step % 30 == 0) {
      keyboardMain_taskFlashHeartbeatLed();
    };
    if (step % 30 == 2) {
      keyboardMain_taskFlashHeartbeatLed();
    };
  }
  slavePacketReceivedFromMaster = false;
}

static void slave_start() {
  keyboardMain_setAsSplitSlave();
  boardLink_setupSlaveReceiver(slave_onReceiverInterruption);

  while (1) {
    if (taskOrder == SplitOp_TaskOrder_ScanKeyStates) {
      keyboardMain_udpateKeyScanners();
      // keyboardMain_updateKeyIndicatorLed();
      keyboardMain_updateInputSlotInidicatorLed();
      slave_prepareKeyStateSendingBytes();
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
    if (taskOrder == SplitOp_TaskOrder_FlashHeartbeat) {
      keyboardMain_taskFlashHeartbeatLed();
      taskOrder = 0;
    }
    if (masterStateReceived) {
      slave_consumeMasterStatePackets();
      masterStateReceived = false;
    }
    taskForEach100ms(slave_ledTask);
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

static void detection_ledTask(uint32_t step) {
  //2回ずつ点滅
  if (step % 30 == 0) {
    keyboardMain_taskFlashHeartbeatLed();
  };
  if (step % 30 == 2) {
    keyboardMain_taskFlashHeartbeatLed();
  };
}

//USB接続が確立していない期間の動作
//双方待機し、USB接続が確立すると自分がMasterになり、相手にMaster確定通知パケットを送る
static bool detection_determineMasterSlaveByUsbConnection() {
  boardLink_initialize();
  boardLink_setupSlaveReceiver(detection_onDataReceivedFromMaster);
  system_enableInterrupts();

  bool isMaster = true;

  uint32_t tick = 0;
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
    taskForEach100ms(detection_ledTask);
    delayMs(1);
    tick++;
  }
  boardIo_writeLed1(0);
  boardLink_clearSlaveReceiver();
  return isMaster;
}

static bool detection_determineMasterSlaveByPin() {
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
  bool isMaster = detection_determineMasterSlaveByPin();
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
  configManager_setParameterExposeFlag(SystemParameter_MasterSide);
  keyboardMain_initialize();
  usbIoCore_initialize();
  bool isMaster = detection_determineMasterSlaveByUsbConnection();
  printf("isMaster:%d\n", isMaster);
  showModeByLedBlinkPattern(isMaster);
  if (isMaster) {
    master_start();
  } else {
    usbIoCore_deInit();
    slave_start();
  }
}

void splitKeyboard_setNumScanSlots(uint8_t _numScanSlotsLeft, uint8_t _numScanSlotsRight) {
  numScanSlots = _numScanSlotsLeft + _numScanSlotsRight;
  righthandScanSlotsOffset = _numScanSlotsLeft;
  numScanSlotsLeft = _numScanSlotsLeft;
  numScanSlotsRight = _numScanSlotsRight;
  numScanSlotBytesLeft = (numScanSlotsLeft + 7) / 8;
  numScanSlotBytesRight = (numScanSlotsRight + 7) / 8;
}

void splitKeyboard_setBoardConfigCallback(void (*callback)(int8_t side)) {
  boardConfigCallback = callback;
}

void splitKeyboard_start() {
  system_initializeUserProgram();
  if (pin_masterSlaveDetermination != -1) {
    startFixedMode();
  } else {
    startDynamicMode();
  }
}
