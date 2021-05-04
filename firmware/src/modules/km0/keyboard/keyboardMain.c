#include "keyboardMain.h"
#include "config.h"
#include "configValidator.h"
#include "configuratorServant.h"
#include "keyboardCoreLogic.h"
#include "km0/common/bitOperations.h"
#include "km0/common/utils.h"
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
static uint8_t keyStateFlags[NumScanSlotBytes] = { 0 };
static uint8_t nextKeyStateFlags[NumScanSlotBytes] = { 0 };

static uint16_t localLayerFlags = 0;
static uint8_t localHidReport[8] = { 0 };

//メインロジックをPC側ユーティリティのLogicSimulatorに移譲するモード
static bool isSideBrainModeEnabled = false;

static KeyboardCallbackSet *callbacks = NULL;

typedef void (*KeyScannerUpdateFunc)(uint8_t *keyStateBitFlags);
static KeyScannerUpdateFunc keyScannerUpdateFunc = NULL;
static KeyScannerUpdateFunc extraKeyScannerUpdateFuncs[NumMaxExtraKeyScanners] = { 0 };
static uint8_t extraKeyScannersLength = 0;

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
    uint8_t curr = utils_readArrayedBitFlagsBit(keyStateFlags, i);
    uint8_t next = utils_readArrayedBitFlagsBit(nextKeyStateFlags, i);
    if (!curr && next) {
      onPhysicalKeyStateChanged(i, true);
    }
    if (curr && !next) {
      onPhysicalKeyStateChanged(i, false);
    }
    utils_writeArrayedBitFlagsBit(keyStateFlags, i, next);
  }
}

//----------------------------------------------------------------------

void keyboardMain_useKeyScanner(void (*_keyScannerUpdateFunc)(uint8_t *keyStateBitFlags)) {
  keyScannerUpdateFunc = _keyScannerUpdateFunc;
}

void keyboardMain_useKeyScannerExtra(void (*_keyScannerUpdateFunc)(uint8_t *keyStateBitFlags)) {
  extraKeyScannerUpdateFuncs[extraKeyScannersLength++] = _keyScannerUpdateFunc;
}

void keyboardMain_setKeyIndexTable(const int8_t *_scanIndexToKeyIndexMap) {
  scanIndexToKeyIndexMap = (uint8_t *)_scanIndexToKeyIndexMap;
}

void keyboardMain_setCallbacks(KeyboardCallbackSet *_callbacks) {
  callbacks = _callbacks;
}

uint8_t *keyboardMain_getNextKeyStateFlags() {
  return nextKeyStateFlags;
}

void keyboardMain_initialize() {
  configValidator_initializeDataStorage();
  setupSerialNumberText();
  usbIoCore_initialize();
  resetKeyboardCoreLogic();
  configuratorServant_initialize(
      configuratorServantStateHandler, customParameterValueHandler);
}

void keyboardMain_udpateKeyScanners() {
  if (keyScannerUpdateFunc) {
    keyScannerUpdateFunc(nextKeyStateFlags);
  }
  for (uint8_t i = 0; i < extraKeyScannersLength; i++) {
    extraKeyScannerUpdateFuncs[i](nextKeyStateFlags);
  }
}

void keyboardMain_processKeyInputUpdate() {
  processKeyStatesUpdate();
  keyboardCoreLogic_processTicker(5);
  processKeyboardCoreLogicOutput();
}

void keyboardMain_processUpdate() {
  usbIoCore_processUpdate();
  configuratorServant_processUpdate();
}
