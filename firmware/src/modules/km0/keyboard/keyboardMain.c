#include "keyboardMain.h"
#include "commandDefinitions.h"
#include "config.h"
#include "configManager.h"
#include "configuratorServant.h"
#include "dataStorage.h"
#include "keyAssignsDataValidator.h"
#include "keyboardCoreLogic.h"
#include "km0/common/bitOperations.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/boardIo.h"
#include "km0/deviceIo/debugUart.h"
#include "km0/deviceIo/usbIoCore.h"
#include "versionDefinitions.h"
#include <stdio.h>

//----------------------------------------------------------------------
//definitions

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

#ifndef KM0_KEYBOARD__NUM_MAX_DISPLAY_MODULES
#define KM0_KEYBOARD__NUM_MAX_DISPLAY_MODULES 2
#endif
#define NumsMaxDisplayModules KM0_KEYBOARD__NUM_MAX_DISPLAY_MODULES

//----------------------------------------------------------------------
//variables

static uint8_t *scanIndexToKeyIndexMap;

//キー状態
static uint8_t scanSlotStateFlags[NumScanSlotBytes] = { 0 };
static uint8_t nextScanSlotStateFlags[NumScanSlotBytes] = { 0 };

static uint16_t localLayerFlags = 0;
static uint8_t localHidReport[8] = { 0 };

//メインロジックをPC側ユーティリティのLogicSimulatorに移譲するモード
static bool isSimulatorModeEnabled = false;

static KeyboardCallbackSet *callbacks = NULL;

typedef void (*KeyScannerUpdateFunc)(uint8_t *keyStateBitFlags);
static KeyScannerUpdateFunc keyScannerUpdateFunc = NULL;
static KeyScannerUpdateFunc extraKeyScannerUpdateFuncs[NumMaxExtraKeyScanners] = { 0 };
static uint8_t extraKeyScannersLength = 0;

typedef void (*DisplayUpdateFunc)(void);
static DisplayUpdateFunc displayUpdateFuncs[NumsMaxDisplayModules] = { 0 };
static uint8_t displayModulesLength = 0;

//動的に変更可能なオプション
static bool optionEmitKeyStroke = true;
static bool optionEmitRealtimeEvents = true;
static bool optionAffectKeyHoldStateToLed = true;
static bool optionUseHeartbeatLed = true;
bool optionInvertSide = false;

static bool debugUartConfigured = false;

KeyboardMainExposedState exposedState = {
  .layerStateFlags = 0,
  .hidReportBuf = localHidReport,
  .pressedKeyIndex = KEYINDEX_NONE,
  .isSplitSlave = false,
};

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
  utils_copyBytes(serialNumberTextBuf, (uint8_t *)Kermite_Project_McuCode, 8);
  utils_copyBytes(serialNumberTextBuf + 8, (uint8_t *)KERMITE_PROJECT_ID, 8);
  configuratorServant_readDeviceInstanceCode(serialNumberTextBuf + 16);
  uibioCore_internal_setSerialNumberText(serialNumberTextBuf, 24);
}

static void resetKeyboardCoreLogic() {
  bool keyAssignsDataValid = keyAssignsDataValidator_checkBinaryProfileDataHeader();
  if (keyAssignsDataValid) {
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

static void updateDisplayModules(uint32_t tick) {
  for (uint8_t i = 0; i < displayModulesLength; i++) {
    displayUpdateFuncs[i]();
  }
}

static bool checkIfSomeKeyPressed() {
  for (uint8_t i = 0; i < NumScanSlotBytes; i++) {
    if (nextScanSlotStateFlags[i] > 0) {
      return true;
    }
  }
  return false;
}

//----------------------------------------------------------------------
//callbacks

//カスタムパラメタロード/変更時に呼ばれるハンドラ
static void parameterValueHandler(uint8_t slotIndex, uint8_t value) {
  if (callbacks && callbacks->customParameterHandlerOverride) {
    callbacks->customParameterHandlerOverride(slotIndex, value);
    return;
  }

  if (slotIndex == SystemParameter_EmitKeyStroke) {
    optionEmitKeyStroke = !!value;
  } else if (slotIndex == SystemParameter_EmitRealtimeEvents) {
    optionEmitRealtimeEvents = !!value;
  } else if (slotIndex == SystemParameter_KeyHoldIndicatorLed) {
    optionAffectKeyHoldStateToLed = !!value;
  } else if (slotIndex == SystemParameter_HeartbeatLed) {
    optionUseHeartbeatLed = !!value;
  } else if (slotIndex == SystemParameter_MasterSide) {
    //value: (0:left, 1:right)
    optionInvertSide = value == 1;
  } else if (slotIndex == SystemParameter_SystemLayout) {
    keyboardCoreLogic_setSystemLayout(value);
  } else if (slotIndex == SystemParameter_WiringMode) {
    keyboardCoreLogic_setWiringMode(value);
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
  if (state == ConfiguratorServentState_SimulatorModeEnabled) {
    isSimulatorModeEnabled = true;
    printf("simulator mode\n");
  }
  if (state == ConfiguratorServentState_SimulatorModeDisabled) {
    isSimulatorModeEnabled = false;
    printf("standalone mode\n");
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
    exposedState.layerStateFlags = layerFlags;
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
  if (keyIndex == KEYINDEX_NONE) {
    return;
  }
  if (isDown) {
    printf("keydown %d\n", keyIndex);
    exposedState.pressedKeyIndex = keyIndex;
  } else {
    printf("keyup %d\n", keyIndex);
    exposedState.pressedKeyIndex = KEYINDEX_NONE;
  }

  //ユーティリティにキー状態変化イベントを送信
  if (optionEmitRealtimeEvents) {
    configuratorServant_emitRealtimeKeyEvent(keyIndex, isDown);
  }

  if (callbacks && callbacks->keyStateChanged) {
    callbacks->keyStateChanged(keyIndex, isDown);
  }

  if (!isSimulatorModeEnabled) {
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

void keyboardMain_useDebugUart(uint32_t baud) {
  debugUart_initialize(baud);
  debugUartConfigured = true;
  printf("--------\n");
}

void keyboardMain_useKeyScanner(void (*_keyScannerUpdateFunc)(uint8_t *keyStateBitFlags)) {
  keyScannerUpdateFunc = _keyScannerUpdateFunc;
}

void keyboardMain_useKeyScannerExtra(void (*_keyScannerUpdateFunc)(uint8_t *keyStateBitFlags)) {
  extraKeyScannerUpdateFuncs[extraKeyScannersLength++] = _keyScannerUpdateFunc;
}

void keyboardMain_useDisplayModule(void (*_displayModuleUpdateFunc)(void)) {
  displayUpdateFuncs[displayModulesLength++] = _displayModuleUpdateFunc;
}

void keyboardMain_setKeyIndexTable(const int8_t *_scanIndexToKeyIndexMap) {
  scanIndexToKeyIndexMap = (uint8_t *)_scanIndexToKeyIndexMap;
}

void keyboardMain_setCallbacks(KeyboardCallbackSet *_callbacks) {
  callbacks = _callbacks;
}

void keyboardMain_setAsSplitSlave() {
  exposedState.isSplitSlave = true;
}

uint8_t *keyboardMain_getNextScanSlotStateFlags() {
  return nextScanSlotStateFlags;
}

void keyboardMain_initialize() {
  if (!debugUartConfigured) {
    debugUart_disable();
  }
  dataStorage_initialize();
  configManager_addParameterChangeListener(parameterValueHandler);
  configManager_initialize();
  setupSerialNumberText();
  usbIoCore_initialize();
  resetKeyboardCoreLogic();
  configuratorServant_initialize(configuratorServantStateHandler);
}

void keyboardMain_udpateKeyScanners() {
  updateKeyScanners();
}

void keyboardMain_processKeyInputUpdate(uint8_t tickInterval) {
  processKeyStatesUpdate();
  keyboardCoreLogic_processTicker(tickInterval);
  processKeyboardCoreLogicOutput();
}

void keyboardMain_updateKeyInidicatorLed() {
  if (optionAffectKeyHoldStateToLed) {
    bool isKeyPressed = checkIfSomeKeyPressed();
    boardIo_writeLed2(isKeyPressed);
  }
}

void keyboardMain_updateHeartBeatLed(uint32_t tick) {
  if (optionUseHeartbeatLed) {
    if (tick % 4000 == 0) {
      boardIo_writeLed1(true);
    }
    if (tick % 4000 == 4) {
      boardIo_writeLed1(false);
    }
  }
}

void keyboardMain_updateDisplayModules(uint32_t tick) {
  updateDisplayModules(tick);
}

void keyboardMain_processUpdate() {
  usbIoCore_processUpdate();
  configuratorServant_processUpdate();
  configManager_processUpdate();
}
