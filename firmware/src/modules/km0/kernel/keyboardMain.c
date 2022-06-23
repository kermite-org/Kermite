#include "keyboardMain.h"
#include "commandDefinitions.h"
#include "configManager.h"
#include "configuratorServant.h"
#include "dataStorage.h"
#include "firmwareMetadata.h"
#include "keyMappingDataValidator.h"
#include "keyboardCoreLogic.h"
#include "keyboardMainInternal.h"
#include "km0/base/bitOperations.h"
#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "km0/device/boardIo.h"
#include "km0/device/dataMemory.h"
#include "km0/device/system.h"
#include "km0/device/usbIoCore.h"
#include "versionDefinitions.h"
#include <stdio.h>

//----------------------------------------------------------------------
//definitions

#ifndef KM0_KEYBOARD__NUM_SCAN_SLOTS
#error KM0_KEYBOARD__NUM_SCAN_SLOTS is not defined
#endif

#define NumScanSlots KM0_KEYBOARD__NUM_SCAN_SLOTS
//#define NumScanSlotBytes Ceil(NumScanSlots / 8)
#define NumScanSlotBytes ((NumScanSlots + 7) / 8)

#ifndef KM0_KEYBOARD__NUM_MAX_KEY_SCANNERS
#define KM0_KEYBOARD__NUM_MAX_KEY_SCANNERS 4
#endif
#define NumMaxKeyScanners KM0_KEYBOARD__NUM_MAX_KEY_SCANNERS

#ifndef KM0_KEYBOARD__NUM_MAX_RGB_LIGHTING_MODULES
#define KM0_KEYBOARD__NUM_MAX_RGB_LIGHTING_MODULES 1
#endif
#define NumsMaxRgbLightingModules KM0_KEYBOARD__NUM_MAX_RGB_LIGHTING_MODULES

//----------------------------------------------------------------------
//variables

static uint8_t *scanIndexToKeyIndexMap = NULL;

//キー状態

/*
scanSlotFlags, nextScanSlotFlags
 前半に左手側,後半に右手側のキー状態を持つ
*/
static uint8_t scanSlotFlags[NumScanSlotBytes] = { 0 };
static uint8_t inputScanSlotFlags[NumScanSlotBytes] = { 0 };

static uint16_t localLayerFlags = 0;
static uint8_t localHidReport[8] = { 0 };

static uint8_t localHidMouseReport[3] = { 0 };

//メインロジックをPC側ユーティリティのLogicSimulatorに移譲するモード
static bool isSimulatorModeEnabled = false;

//一時的にキー出力を無効にするモード
static bool isMuteModeEnabled = false;

static KeyboardCallbackSet *callbacks = NULL;

typedef void (*KeyScannerUpdateFunc)(uint8_t *keyStateBitFlags);
static KeyScannerUpdateFunc keyScannerUpdateFuncs[NumMaxKeyScanners] = { 0 };
static uint8_t keyScannersLength = 0;

typedef void (*PointingDeviceUpdateFunc)(int8_t *outDeltaX, int8_t *outDeltaY);
PointingDeviceUpdateFunc pointingDeviceUpdateFunc = NULL;

typedef void (*VisualModuleUpdateFunc)(void);
static VisualModuleUpdateFunc rgbLightingUpdateFuncs[NumsMaxRgbLightingModules] = { 0 };
static uint8_t rgbLightingModulesLength = 0;

static VisualModuleUpdateFunc oledDisplayUpdateFunc = NULL;

static VisualModuleUpdateFunc hostKeyboardStatusOutputFunc = NULL;

//動的に変更可能なオプション
static bool optionEmitRealtimeEvents = true;
static bool optionAffectKeyHoldStateToLed = true;
static bool optionUseHeartbeatLed = true;

KeyboardMainExposedState keyboardMain_exposedState = {
  .layerStateFlags = 0,
  .hidReportBuf = localHidReport,
  .pressedKeyIndex = KEYINDEX_NONE,
  .isSplitSlave = false,
  .optionInvertSide = false,
  .hostKeyboardStateFlags = 0
};

typedef void (*KeySlotStateChangedCallback)(uint8_t slotIndex, bool isDown);

KeySlotStateChangedCallback keySlotStateChangedCallback = NULL;

static uint8_t blankHidReport[8] = { 0 };

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

static char *writeTextBytes(char *buf, char *text, int len) {
  utils_copyTextBytes(buf, text, len);
  return buf + len;
}


static char tempProductNameBuf[32];

//usb serial number
//format: <Prefix(8)>:<McuCode(3)>:<FirmwareId(6)>:<ProjectId(6)>:<VariationId(2)>:<DeviceInstanceCode(4)>
//example: A152FD2C:M01:7qHDCp:K3e89X:01:d46d
//length: 38bytes (39bytes with null terminator)
static void setupUsbDeviceAttributes() {
  char *buf = usbIoCore_getSerialNumberTextBufferPointer();
  buf = writeTextBytes(buf, Kermite_CommonSerialNumberPrefix, 8);
  buf = writeTextBytes(buf, ":", 1);
  buf = writeTextBytes(buf, Kermite_Project_McuCode, 3);
  buf = writeTextBytes(buf, ":", 1);
  buf = writeTextBytes(buf, KERMITE_FIRMWARE_ID, 6);
  buf = writeTextBytes(buf, ":", 1);
  buf = writeTextBytes(buf, commonFirmwareMetadata.projectId, 6);
  buf = writeTextBytes(buf, ":", 1);
  buf = writeTextBytes(buf, commonFirmwareMetadata.variationId, 2);
  buf = writeTextBytes(buf, ":", 1);
  buf = writeTextBytes(buf, commonFirmwareMetadata.deviceInstanceCode, 4);
  buf = writeTextBytes(buf, "\0", 1);

  // usbIoCore_setProductName(commonFirmwareMetadata.keyboardName);
  snprintf(tempProductNameBuf, 32, "%s #%s", commonFirmwareMetadata.keyboardName, commonFirmwareMetadata.deviceInstanceCode);
  usbIoCore_setProductName(tempProductNameBuf);
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

static void updateRgbLightingModules(uint32_t tick) {
  for (uint8_t i = 0; i < rgbLightingModulesLength; i++) {
    rgbLightingUpdateFuncs[i]();
  }
}

static void updateOledDisplayModule(uint32_t tick) {
  if (oledDisplayUpdateFunc) {
    oledDisplayUpdateFunc();
  }
}

static void updateHostKeyboardStatusOutputModule() {
  if (hostKeyboardStatusOutputFunc) {
    hostKeyboardStatusOutputFunc();
  }
}

static bool checkIfSomeKeyPressed() {
  for (uint8_t i = 0; i < NumScanSlotBytes; i++) {
    if (scanSlotFlags[i] > 0) {
      return true;
    }
  }
  return false;
}

static bool checkIfSomeInputSlotKeyPressed() {
  for (uint8_t i = 0; i < NumScanSlotBytes; i++) {
    if (inputScanSlotFlags[i] > 0) {
      return true;
    }
  }
  return false;
}

//----------------------------------------------------------------------
//callbacks

//カスタムパラメタロード/変更時に呼ばれるハンドラ
static void parameterValueHandler(uint8_t eventType, uint8_t slotIndex, uint8_t value) {
  if (eventType == ParameterChangeEventType_ChangedAll) {
    configManager_dispatchSingleParameterChangedEventsAll(parameterValueHandler);
    return;
  }

  if (callbacks && callbacks->customParameterHandlerOverride) {
    callbacks->customParameterHandlerOverride(slotIndex, value);
    return;
  }

  if (slotIndex == SystemParameter_EmitRealtimeEvents) {
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
    printf("system layout: %s\n", value == 1 ? "JIS" : "US");
  } else if (slotIndex == SystemParameter_WiringMode) {
    keyboardCoreLogic_setWiringMode(value);
    printf("routing channel: %s\n", value == 1 ? "Alter" : "Main");
  }

  if (callbacks && callbacks->customParameterHandlerExtended) {
    callbacks->customParameterHandlerExtended(slotIndex, value);
  }
}

static void setSimulatorMode(bool enabled) {
  if (isSimulatorModeEnabled != enabled) {
    printf("simulator mode: %s\n", enabled ? "on" : "off");
    isSimulatorModeEnabled = enabled;
    if (!enabled) {
      usbIoCore_hidKeyboard_writeReport(blankHidReport);
    }
  }
}

static void setMuteMode(bool enabled) {
  if (isMuteModeEnabled != enabled) {
    printf("output mute: %s\n", enabled ? "on" : "off");
    isMuteModeEnabled = enabled;
  }
}

//ユーティリティによる設定書き込み時に呼ばれるハンドラ
static void ConfiguratorServantEventHandler(uint8_t event) {
  if (event == ConfiguratorServantEvent_ConnectedByHost) {
  }
  if (event == ConfiguratorServantEvent_ConnectionClosingByHost) {
    setSimulatorMode(false);
    setMuteMode(false);
  }
  if (event == ConfiguratorServantEvent_KeyMemoryUpdationStarted) {
    keyboardCoreLogic_halt();
  }
  if (event == ConfiguratorServantEvent_KeyMemoryUpdationDone) {
    resetKeyboardCoreLogic();
  }
  if (event == ConfiguratorServantEvent_SimulatorModeEnabled) {
    setSimulatorMode(true);
  }
  if (event == ConfiguratorServantEvent_SimulatorModeDisabled) {
    setSimulatorMode(false);
  }
  if (event == ConfiguratorServantEvent_MuteModeEnabled) {
    setMuteMode(true);
  }
  if (event == ConfiguratorServantEvent_MuteModeDisabled) {
    setMuteMode(false);
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
    if (!isMuteModeEnabled) {
      usbIoCore_hidKeyboard_writeReport(hidReport);
    }
    utils_copyBytes(localHidReport, hidReport, 8);
    changed = true;
  }
  if (changed) {
    debugDumpLocalOutputState();
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
  uint8_t keyIndex = scanIndex;
  if (scanIndexToKeyIndexMap) {
    keyIndex = scanIndexToKeyIndexMap[scanIndex];
    if (keyIndex == KEYINDEX_NONE) {
      return;
    }
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
  for (uint8_t i = 0; i < NumScanSlots; i++) {
    uint8_t curr = utils_readArrayedBitFlagsBit(scanSlotFlags, i);
    uint8_t next = utils_readArrayedBitFlagsBit(inputScanSlotFlags, i);
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
  if (utils_checkPointerArrayIncludes((void **)keyScannerUpdateFuncs, keyScannersLength, _keyScannerUpdateFunc)) {
    return;
  }
  keyScannerUpdateFuncs[keyScannersLength++] = _keyScannerUpdateFunc;
}

void keyboardMain_useRgbLightingModule(void (*_updateFn)(void)) {
  if (utils_checkPointerArrayIncludes((void **)rgbLightingUpdateFuncs, rgbLightingModulesLength, _updateFn)) {
    return;
  }
  rgbLightingUpdateFuncs[rgbLightingModulesLength++] = _updateFn;
}

void keyboardMain_usePointingDevice(void (*_pointingDeviceUpdateFunc)(int8_t *outDeltaX, int8_t *outDeltaY)) {
  pointingDeviceUpdateFunc = _pointingDeviceUpdateFunc;
}

void keyboardMain_useOledDisplayModule(void (*_updateFn)(void)) {
  oledDisplayUpdateFunc = _updateFn;
}

void keyboardMain_useHostKeyboardStatusOutputModule(void (*_updateFn)(void)) {
  hostKeyboardStatusOutputFunc = _updateFn;
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

uint8_t *keyboardMain_getScanSlotFlags() {
  return scanSlotFlags;
}

uint8_t *keyboardMain_getInputScanSlotFlags() {
  return inputScanSlotFlags;
}

void keyboardMain_initialize() {
  configManager_setParameterExposeFlag(SystemParameter_EmitRealtimeEvents);
  configManager_setParameterExposeFlag(SystemParameter_SystemLayout);
  configManager_setParameterExposeFlag(SystemParameter_WiringMode);
  dataMemory_initialize();
  dataStorage_initialize();
  configManager_addParameterChangeListener(parameterValueHandler);
  configManager_initialize();
  resetKeyboardCoreLogic();
  configuratorServant_initialize(ConfiguratorServantEventHandler);
  setupUsbDeviceAttributes();
}

void keyboardMain_udpateKeyScanners() {
  updateKeyScanners();
}

void keyboardMain_updatePointingDevice() {
  int8_t deltaX = 0, deltaY = 0;
  if (pointingDeviceUpdateFunc) {
    pointingDeviceUpdateFunc(&deltaX, &deltaY);
    if (deltaX != 0 || deltaY != 0) {
      localHidMouseReport[0] = 0;
      localHidMouseReport[1] = deltaX;
      localHidMouseReport[2] = deltaY;
      usbIoCore_hidMouse_writeReport(localHidMouseReport);
    }
  }
}

void keyboardMain_processKeyInputUpdate() {
  static uint32_t prevTickMs = 0;
  uint32_t tickMs = system_getSystemTimeMs();
  uint32_t elapsed = utils_clamp(tickMs - prevTickMs, 0, 100);

  processKeyStatesUpdate();
  keyboardCoreLogic_processTicker(elapsed);
  processKeyboardCoreLogicOutput();

  prevTickMs = tickMs;
}

void keyboardMain_updateKeyInidicatorLed() {
  if (optionAffectKeyHoldStateToLed) {
    bool isKeyPressed = checkIfSomeKeyPressed();
    boardIo_writeLed2(isKeyPressed);
  }
}

void keyboardMain_updateInputSlotInidicatorLed() {
  if (optionAffectKeyHoldStateToLed) {
    bool isKeyPressed = checkIfSomeInputSlotKeyPressed();
    boardIo_writeLed2(isKeyPressed);
  }
}

void keyboardMain_taskFlashHeartbeatLed() {
  if (optionUseHeartbeatLed) {
    boardIo_writeLed1(true);
    delayMs(2);
    boardIo_writeLed1(false);
  }
}

void keyboardMain_updateRgbLightingModules(uint32_t tick) {
  updateRgbLightingModules(tick);
}

void keyboardMain_updateOledDisplayModule(uint32_t tick) {
  updateOledDisplayModule(tick);
}

void keyboardMain_updateHostKeyboardStatusOutputModule() {
  updateHostKeyboardStatusOutputModule();
}

void keyboardMain_processUpdate() {
  usbIoCore_processUpdate();
  keyboardMain_exposedState.hostKeyboardStateFlags = usbIoCore_hidKeyboard_getStatusLedFlags();
  configuratorServant_processUpdate();
  configManager_processUpdate();
  dataMemory_processTick();
}

void keyboardMain_setKeySlotStateChangedCallback(void (*callback)(uint8_t slotIndex, bool isDown)) {
  keySlotStateChangedCallback = callback;
}
