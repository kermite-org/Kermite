#include "keyboardMain.h"
#include "config.h"
#include "configValidator.h"
#include "configuratorServant.h"
#include "keyboardCoreLogic.h"
#include "km0/common/bitOperations.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/usbIoCore.h"
#include "versions.h"
#include <stdio.h>

//----------------------------------------------------------------------
//definitions

enum {
  OptionSlot_EmitKeyStroke = 0,
  OptionSlot_EmitRealtimeEvents = 1,
  OptionSlot_AffectKeyHoldStateToLed = 2,
  OptionSlot_UseHeartBeatLed = 3,
  OptionSlot_MasterSide = 4
};

#ifndef KM0_KEYBOARD__NUM_SCAN_SLOTS
#error KM0_KEYBOARD__NUM_SCAN_SLOTS is not defined
#endif

#define NumScanSlots KM0_KEYBOARD__NUM_SCAN_SLOTS

//#define NumScanSlotBytes Ceil(NumScanSlots / 8)
#define NumScanSlotBytes ((NumScanSlots + 7) >> 3)

#ifndef KM0_KEYBOARD__NUM_MAX_EXTRA_KEY_SCANNERS
#define KM0_KEYBOARD__NUM_MAX_EXTRA_KEY_SCANNERS 1
#endif
#define NumMaxExtraKeyScanners KM0_KEYBOARD__NUM_MAX_EXTRA_KEY_SCANNERS

#ifndef KM0_KEYBOARD__NUM_MAX_DISPLAY_MODULE_TASKS
#define KM0_KEYBOARD__NUM_MAX_DISPLAY_MODULE_TASKS 2
#endif
#define NumsMaxDisplayModuleTasks KM0_KEYBOARD__NUM_MAX_DISPLAY_MODULE_TASKS

//----------------------------------------------------------------------
//public variables

uint8_t pressedKeyCount = 0;

//動的に変更可能なオプション
bool optionEmitKeyStroke = true;
bool optionEmitRealtimeEvents = true;
bool optionAffectKeyHoldStateToLed = true;
bool optionUseHeartbeatLed = true;
bool optionInvertSide = false;

//----------------------------------------------------------------------
//variables

static uint8_t *scanIndexToKeyIndexMap;

//キー状態
static uint8_t scanSlotStateFlags[NumScanSlotBytes] = { 0 };
static uint8_t nextScanSlotStateFlags[NumScanSlotBytes] = { 0 };

static uint16_t localLayerFlags = 0;
static uint8_t localHidReport[8] = { 0 };

//メインロジックをPC側ユーティリティのLogicSimulatorに移譲するモード
static bool isSideBrainModeEnabled = false;

static KeyboardCallbackSet *callbacks = NULL;

typedef void (*KeyScannerUpdateFunc)(uint8_t *keyStateBitFlags);
static KeyScannerUpdateFunc keyScannerUpdateFunc = NULL;
static KeyScannerUpdateFunc extraKeyScannerUpdateFuncs[NumMaxExtraKeyScanners] = { 0 };
static uint8_t extraKeyScannersLength = 0;

typedef struct {
  void (*updateFunc)(void);
  uint8_t intervalMs;
} DisplayModuleTask;

static DisplayModuleTask displayModuelTasks[NumsMaxDisplayModuleTasks] = { 0 };
static uint8_t displayModuelTasksLength = 0;

static bool debugUartConfigured = false;

//----------------------------------------------------------------------
//helpers

static void debugDumpLocalOutputState() {
  printf("HID report:[");
  for (uint16_t i = 0; i < 8; i++) {
    printf("%02X ", localHidReport[i]);
  }
  printf("], ");
  printf("layers: %02X\n", localLayerFlags);
}

static void setupSerialNumberText() {
  static uint8_t serialNumberTextBuf[24];
  utils_copyBytes(serialNumberTextBuf, (uint8_t *)KERMITE_MCU_CODE, 8);
  utils_copyBytes(serialNumberTextBuf + 8, (uint8_t *)PROJECT_ID, 8);
  configuratorServant_readDeviceInstanceCode(serialNumberTextBuf + 16);
  uibioCore_internal_setSerialNumberText(serialNumberTextBuf, 24);
}

static void resetKeyboardCoreLogic() {
  bool configMemoryValid = configValidator_checkDataHeader();
  if (configMemoryValid) {
    keyboardCoreLogic_initialize();
  } else {
    keyboardCoreLogic_halt();
  }
}

static void updateKeyScanners() {
  if (keyScannerUpdateFunc) {
    keyScannerUpdateFunc(nextScanSlotStateFlags);
  }
  for (uint8_t i = 0; i < extraKeyScannersLength; i++) {
    KeyScannerUpdateFunc updateFunc = extraKeyScannerUpdateFuncs[i];
    if (updateFunc) {
      updateFunc(nextScanSlotStateFlags);
    }
  }
}

static void updateDisplayModules(uint32_t tickMs) {
  for (uint8_t i = 0; i < displayModuelTasksLength; i++) {
    DisplayModuleTask *task = &displayModuelTasks[i];
    if (tickMs % task->intervalMs == 0) {
      task->updateFunc();
    }
  }
}

//----------------------------------------------------------------------
//callbacks

//カスタムパラメタロード/変更時に呼ばれるハンドラ
static void customParameterValueHandler(uint8_t slotIndex, uint8_t value) {
  if (callbacks && callbacks->customParameterHandlerOverride) {
    callbacks->customParameterHandlerOverride(slotIndex, value);
    return;
  }

  if (slotIndex == OptionSlot_EmitKeyStroke) {
    optionEmitKeyStroke = !!value;
  } else if (slotIndex == OptionSlot_EmitRealtimeEvents) {
    optionEmitRealtimeEvents = !!value;
  } else if (slotIndex == OptionSlot_AffectKeyHoldStateToLed) {
    optionAffectKeyHoldStateToLed = !!value;
  } else if (slotIndex == OptionSlot_UseHeartBeatLed) {
    optionUseHeartbeatLed = !!value;
  } else if (slotIndex == OptionSlot_MasterSide) {
    //value: (0:unset, 1:left, 2:right)
    optionInvertSide = value == 2;
  }

  if (callbacks && callbacks->customParameterHandlerChained) {
    callbacks->customParameterHandlerChained(slotIndex, value);
  }
}

//ユーティリティによる設定書き込み時に呼ばれるハンドラ
static void configuratorServantStateHandler(uint8_t state) {
  if (state == ConfiguratorServantState_KeyMemoryUpdationStarted) {
    keyboardCoreLogic_halt();
  }
  if (state == ConfiguratorServentState_KeyMemoryUpdationDone) {
    resetKeyboardCoreLogic();
  }
  if (state == ConfiguratorServentState_SideBrainModeEnabled) {
    isSideBrainModeEnabled = true;
  }
  if (state == ConfiguratorServentState_SideBrainModeDisabled) {
    isSideBrainModeEnabled = false;
  }
}

//ロジック結果出力処理
static void processKeyboardCoreLogicOutput() {
  uint16_t layerFlags = keyboardCoreLogic_getLayerActiveFlags();
  uint8_t *hidReport = keyboardCoreLogic_getOutputHidReportBytes();

  bool changed = false;
  if (layerFlags != localLayerFlags) {
    if (optionEmitRealtimeEvents) {
      configuratorServant_emitRelatimeLayerEvent(layerFlags);
    }
    if (callbacks && callbacks->layerStateChanged) {
      callbacks->layerStateChanged(layerFlags);
    }
    localLayerFlags = layerFlags;
    changed = true;
  }
  if (!utils_compareBytes(hidReport, localHidReport, 8)) {
    if (optionEmitKeyStroke) {
      usbIoCore_hidKeyboard_writeReport(hidReport);
    }
    utils_copyBytes(localHidReport, hidReport, 8);
    changed = true;
  }
  if (changed) {
    debugDumpLocalOutputState();
  }

  uint16_t assignHitResult = keyboardCoreLogic_peekAssignHitResult();
  if (assignHitResult != 0 && optionEmitRealtimeEvents) {
    configuratorServant_emitRelatimeAssignHitEvent(assignHitResult);
  }
}

//キーが押された/離されたときに呼ばれるハンドラ
static void onPhysicalKeyStateChanged(uint8_t scanIndex, bool isDown) {
  if (scanIndex >= NumScanSlots) {
    return;
  }
  uint8_t keyIndex = scanIndexToKeyIndexMap[scanIndex];
  if (keyIndex == 0xFF) {
    return;
  }
  if (isDown) {
    printf("keydown %d\n", keyIndex);
    pressedKeyCount++;
  } else {
    printf("keyup %d\n", keyIndex);
    pressedKeyCount--;
  }

  //ユーティリティにキー状態変化イベントを送信
  if (optionEmitRealtimeEvents) {
    configuratorServant_emitRealtimeKeyEvent(keyIndex, isDown);
  }

  if (callbacks && callbacks->keyStateChanged) {
    callbacks->keyStateChanged(keyIndex, isDown);
  }

  if (!isSideBrainModeEnabled) {
    //メインロジックでキー入力を処理
    keyboardCoreLogic_issuePhysicalKeyStateChanged(keyIndex, isDown);
  }
}

//----------------------------------------------------------------------

//キー状態更新処理
static void processKeyStatesUpdate() {
  for (uint8_t i = 0; i < NumScanSlots; i++) {
    uint8_t curr = utils_readArrayedBitFlagsBit(scanSlotStateFlags, i);
    uint8_t next = utils_readArrayedBitFlagsBit(nextScanSlotStateFlags, i);
    if (!curr && next) {
      onPhysicalKeyStateChanged(i, true);
    }
    if (curr && !next) {
      onPhysicalKeyStateChanged(i, false);
    }
    utils_writeArrayedBitFlagsBit(scanSlotStateFlags, i, next);
  }
}

//----------------------------------------------------------------------

void keyboardMain_useIndicatorLeds(int8_t pin1, uint8_t pin2, bool invert) {
  boardIo_setupLeds(pin1, pin2, invert);
}

void keyboardMain_useIndicatorRgbLed(int8_t pin) {
  boardIo_setupLedsRgb(pin);
}

void keyboardMain_useDebugUart(uint32_t baud) {
  debugUart_setup(baud);
  debugUartConfigured = true;
}

void keyboardMain_useKeyScanner(void (*_keyScannerUpdateFunc)(uint8_t *keyStateBitFlags)) {
  keyScannerUpdateFunc = _keyScannerUpdateFunc;
}

void keyboardMain_useKeyScannerExtra(void (*_keyScannerUpdateFunc)(uint8_t *keyStateBitFlags)) {
  extraKeyScannerUpdateFuncs[extraKeyScannersLength++] = _keyScannerUpdateFunc;
}

void keyboardMain_useDisplayModule(void (*_displayModuleUpdateFunc)(void), uint8_t frameRate) {
  DisplayModuleTask *task = &displayModuelTasks[displayModuelTasksLength];
  task->updateFunc = _displayModuleUpdateFunc;
  task->intervalMs = 1000 / frameRate;
  displayModuelTasksLength++;
}

void keyboardMain_setKeyIndexTable(const int8_t *_scanIndexToKeyIndexMap) {
  scanIndexToKeyIndexMap = (uint8_t *)_scanIndexToKeyIndexMap;
}

void keyboardMain_setCallbacks(KeyboardCallbackSet *_callbacks) {
  callbacks = _callbacks;
}

uint8_t *keyboardMain_getNextScanSlotStateFlags() {
  return nextScanSlotStateFlags;
}

void keyboardMain_initialize() {
  if (!debugUartConfigured) {
    debugUart_disable();
  }
  configValidator_initializeDataStorage();
  setupSerialNumberText();
  usbIoCore_initialize();
  resetKeyboardCoreLogic();
  configuratorServant_initialize(
      configuratorServantStateHandler, customParameterValueHandler);
}

void keyboardMain_udpateKeyScanners() {
  updateKeyScanners();
}

void keyboardMain_processKeyInputUpdate() {
  processKeyStatesUpdate();
  keyboardCoreLogic_processTicker(5);
  processKeyboardCoreLogicOutput();
}

void keyboardMain_processUpdate(uint32_t tickMs) {
  updateDisplayModules(tickMs);
  usbIoCore_processUpdate();
  configuratorServant_processUpdate();
}
