#include "keyboardMain.h"
#include "commandDefinitions.h"
#include "config.h"
#include "configManager.h"
#include "configuratorServant.h"
#include "dataStorage.h"
#include "keyMappingDataValidator.h"
#include "keyboardCoreLogic.h"
#include "keyboardMainInternal.h"
#include "km0/base/bitOperations.h"
#include "km0/base/utils.h"
#include "km0/device/boardIo.h"
#include "km0/device/dataMemory.h"
#include "km0/device/usbIoCore.h"
#include "versionDefinitions.h"
#include <stdio.h>

//----------------------------------------------------------------------
//definitions

#ifndef KM0_KEYBOARD__NUM_SCAN_SLOTS
#error KM0_KEYBOARD__NUM_SCAN_SLOTS is not defined
#endif

#define NumScanSlots KM0_KEYBOARD__NUM_SCAN_SLOTS
#define NumScanSlotsHalf (NumScanSlots >> 1)

//#define NumScanSlotBytes Ceil(NumScanSlots / 8)
#define NumScanSlotBytes ((NumScanSlots + 7) >> 3)

#ifndef KM0_KEYBOARD__NUM_MAX_KEY_SCANNERS
#define KM0_KEYBOARD__NUM_MAX_KEY_SCANNERS 4
#endif
#define NumMaxKeyScanners KM0_KEYBOARD__NUM_MAX_KEY_SCANNERS

#ifndef KM0_KEYBOARD__NUM_MAX_DISPLAY_MODULES
#define KM0_KEYBOARD__NUM_MAX_DISPLAY_MODULES 2
#endif
#define NumsMaxDisplayModules KM0_KEYBOARD__NUM_MAX_DISPLAY_MODULES

//----------------------------------------------------------------------
//variables

static uint8_t *scanIndexToKeyIndexMap;

//キー状態

/*
inputScanSlotFlags:
 master, slaveとも前半部分に自分側のキー状態を持つ
 masterは後半部分にslave側のキー状態も持つ
*/
static uint8_t inputScanSlotFlags[NumScanSlotBytes] = { 0 };
/*
scanSlotFlags, nextScanSlotFlags
左手側がmasterの場合、右手側がmaseterの場合どちらの場合でも
 前半に左手側,後半に右手側のキー状態を持つ
*/
static uint8_t scanSlotFlags[NumScanSlotBytes] = { 0 };
static uint8_t nextScanSlotFlags[NumScanSlotBytes] = { 0 };

static uint16_t localLayerFlags = 0;
static uint8_t localHidReport[8] = { 0 };

//メインロジックをPC側ユーティリティのLogicSimulatorに移譲するモード
static bool isSimulatorModeEnabled = false;

static KeyboardCallbackSet *callbacks = NULL;

typedef void (*KeyScannerUpdateFunc)(uint8_t *keyStateBitFlags);
static KeyScannerUpdateFunc keyScannerUpdateFuncs[NumMaxKeyScanners] = { 0 };
static uint8_t keyScannersLength = 0;

typedef void (*DisplayUpdateFunc)(void);
static DisplayUpdateFunc displayUpdateFuncs[NumsMaxDisplayModules] = { 0 };
static uint8_t displayModulesLength = 0;

//動的に変更可能なオプション
static bool optionEmitKeyStroke = true;
static bool optionEmitRealtimeEvents = true;
static bool optionAffectKeyHoldStateToLed = true;
static bool optionUseHeartbeatLed = true;

KeyboardMainExposedState keyboardMain_exposedState = {
  .layerStateFlags = 0,
  .hidReportBuf = localHidReport,
  .pressedKeyIndex = KEYINDEX_NONE,
  .isSplitSlave = false,
  .optionInvertSide = false,
};

typedef void (*KeySlotStateChangedCallback)(uint8_t slotIndex, bool isDown);

KeySlotStateChangedCallback keySlotStateChangedCallback = NULL;

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
  uint8_t *serialNumberTextBuf = usbioCore_getSerialNumberTextBufferPointer();
  utils_copyBytes(serialNumberTextBuf, (uint8_t *)Kermite_Project_McuCode, 8);
  utils_copyBytes(serialNumberTextBuf + 8, (uint8_t *)KERMITE_PROJECT_ID, 8);
  configuratorServant_readDeviceInstanceCode(serialNumberTextBuf + 16);
}

static void resetKeyboardCoreLogic() {
  bool keyMappingDataValid = keyMappingDataValidator_checkBinaryProfileDataHeader();
  if (keyMappingDataValid) {
    keyboardCoreLogic_initialize();
  } else {
    keyboardCoreLogic_halt();
  }
}

static void updateKeyScanners() {
  for (uint8_t i = 0; i < keyScannersLength; i++) {
    KeyScannerUpdateFunc updateFunc = keyScannerUpdateFuncs[i];
    if (updateFunc) {
      updateFunc(inputScanSlotFlags);
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
    if (nextScanSlotFlags[i] > 0) {
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
    keyboardMain_exposedState.optionInvertSide = value == 1;
  } else if (slotIndex == SystemParameter_SystemLayout) {
    keyboardCoreLogic_setSystemLayout(value);
    printf("system layout: %s\n", value == 2 ? "JIS" : "US");
  } else if (slotIndex == SystemParameter_WiringMode) {
    keyboardCoreLogic_setWiringMode(value);
    printf("routing channel: %s\n", value == 1 ? "Alter" : "Main");
  }

  if (callbacks && callbacks->customParameterHandlerExtended) {
    callbacks->customParameterHandlerExtended(slotIndex, value);
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
    printf("behavior mode: Simulator\n");
  }
  if (state == ConfiguratorServentState_SimulatorModeDisabled) {
    isSimulatorModeEnabled = false;
    printf("behavior mode: Standalone\n");
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
    keyboardMain_exposedState.layerStateFlags = layerFlags;
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
  if (keySlotStateChangedCallback) {
    keySlotStateChangedCallback(scanIndex, isDown);
  }
  uint8_t keyIndex = scanIndexToKeyIndexMap[scanIndex];
  if (keyIndex == KEYINDEX_NONE) {
    return;
  }
  if (isDown) {
    printf("keydown %d\n", keyIndex);
    keyboardMain_exposedState.pressedKeyIndex = keyIndex;
  } else {
    printf("keyup %d\n", keyIndex);
    keyboardMain_exposedState.pressedKeyIndex = KEYINDEX_NONE;
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
  if (!keyboardMain_exposedState.optionInvertSide) {
    utils_copyBytes(nextScanSlotFlags, inputScanSlotFlags, NumScanSlotBytes);
  } else {
    for (int i = 0; i < NumScanSlotsHalf; i++) {
      bool a = utils_readArrayedBitFlagsBit(inputScanSlotFlags, i);
      bool b = utils_readArrayedBitFlagsBit(inputScanSlotFlags, NumScanSlotsHalf + i);
      utils_writeArrayedBitFlagsBit(nextScanSlotFlags, i, b);
      utils_writeArrayedBitFlagsBit(nextScanSlotFlags, NumScanSlotsHalf + i, a);
    }
  }
  for (uint8_t i = 0; i < NumScanSlots; i++) {
    uint8_t curr = utils_readArrayedBitFlagsBit(scanSlotFlags, i);
    uint8_t next = utils_readArrayedBitFlagsBit(nextScanSlotFlags, i);
    if (!curr && next) {
      onPhysicalKeyStateChanged(i, true);
    }
    if (curr && !next) {
      onPhysicalKeyStateChanged(i, false);
    }
    utils_writeArrayedBitFlagsBit(scanSlotFlags, i, next);
  }
}

//----------------------------------------------------------------------

void keyboardMain_useKeyScanner(void (*_keyScannerUpdateFunc)(uint8_t *keyStateBitFlags)) {
  keyScannerUpdateFuncs[keyScannersLength++] = _keyScannerUpdateFunc;
}

void keyboardMain_useVisualModule(void (*_displayModuleUpdateFunc)(void)) {
  displayUpdateFuncs[displayModulesLength++] = _displayModuleUpdateFunc;
}

void keyboardMain_setKeyIndexTable(const int8_t *_scanIndexToKeyIndexMap) {
  scanIndexToKeyIndexMap = (uint8_t *)_scanIndexToKeyIndexMap;
}

void keyboardMain_setCallbacks(KeyboardCallbackSet *_callbacks) {
  callbacks = _callbacks;
}

void keyboardMain_setAsSplitSlave() {
  keyboardMain_exposedState.isSplitSlave = true;
}

uint8_t *keyboardMain_getNextScanSlotFlags() {
  return nextScanSlotFlags;
}

uint8_t *keyboardMain_getInputScanSlotFlags() {
  return inputScanSlotFlags;
}

void keyboardMain_initialize() {
  dataMemory_initialize();
  dataStorage_initialize();
  configManager_addParameterChangeListener(parameterValueHandler);
  configManager_initialize();
  setupSerialNumberText();
  // usbIoCore_initialize();
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
  dataMemory_processTick();
}

void keyboardMain_setKeySlotStateChangedCallback(void (*callback)(uint8_t slotIndex, bool isDown)) {
  keySlotStateChangedCallback = callback;
}