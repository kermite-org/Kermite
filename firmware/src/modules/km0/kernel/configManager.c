#include "configManager.h"
#include "commandDefinitions.h"
#include "dataStorage.h"
#include "km0/base/bitOperations.h"
#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "km0/device/dataMemory.h"
#include "km0/device/system.h"
#include "km0/kernel/versionDefinitions.h"
#include <stdio.h>

#ifdef KM0_PARAMETER_EXPOSE_FLAGS_OVERRIDE
static bool overrideExposeFlags = true;
static uint16_t parameterExposeFlagsOverride = KM0_PARAMETER_EXPOSE_FLAGS_OVERRIDE;
#else
static bool overrideExposeFlags = false;
static uint16_t parameterExposeFlagsOverride = 0;
#endif

typedef void (*ParameterChangedListener)(uint8_t eventType, uint8_t parameterIndex, uint8_t value);

static uint8_t systemParameterValues[NumSystemParameters];
static uint16_t addrSystemParameters = 0;
static int lazySaveTick = -1;
static ParameterChangedListener parameterChangedListeners[4] = { 0 };
static int numParameterChangedListeners = 0;

static uint16_t parameterChangedFlags = 0;
static bool allParameterChangedFlag = false;

static bool reqRestToDfu = false;

static uint16_t parameterExposeFlags = 0;

static const T_SystemParametersSet systemParametersDefault = {
  .emitRealtimeEvents = true,
  .keyHoldLedOutput = true,
  .heartbeatLedOutput = true,
  .masterSide = 0,
  .systemLayout = 1,
  .wiringMode = 0,
  .glowActive = false,
  .glowColor = 0,
  .glowBrightness = 20,
  .glowPattern = 0,
  .debounceWaitMs = 0,
};

static T_SystemParametersSet systemParameterMaxValues = {
  .emitRealtimeEvents = 1,
  .keyHoldLedOutput = 1,
  .heartbeatLedOutput = 1,
  .masterSide = 1,
  .systemLayout = 1,
  .wiringMode = 1,
  .glowActive = 1,
  .glowColor = 255,
  .glowBrightness = 255,
  .glowPattern = 255,
  .debounceWaitMs = 200,
};

static void notifyParameterChanged(uint8_t eventType, uint8_t parameterIndex, uint8_t value) {
  for (int i = 0; i < numParameterChangedListeners; i++) {
    ParameterChangedListener listener = parameterChangedListeners[i];
    listener(eventType, parameterIndex, value);
  }
}

static void taskChangedParameterNotification() {
  for (int i = 0; i < NumSystemParameters; i++) {
    if (bit_is_on(parameterChangedFlags, i)) {
      notifyParameterChanged(ParameterChangeEventType_ChangedSinle, i, systemParameterValues[i]);
      bit_off(parameterChangedFlags, i);
    }
  }
  if (allParameterChangedFlag) {
    notifyParameterChanged(ParameterChangeEventType_ChangedAll, 0, 0);
    allParameterChangedFlag = false;
  }
}

static void reserveParameterChangedNotification(uint8_t parameterIndex) {
  bit_on(parameterChangedFlags, parameterIndex);
}

static void reseverAllParameterChangedNotification() {
  allParameterChangedFlag = true;
}

static void reserveLazySave() {
  lazySaveTick = 1000; //およそ1秒後にデータをストレージに書き込む
}

static void taskLazySave() {
  if (lazySaveTick > 0) {
    lazySaveTick--;
    if (lazySaveTick == 0) {
      if (addrSystemParameters) {
        dataMemory_writeBytes(addrSystemParameters, systemParameterValues, NumSystemParameters);
        printf("parameters saved\n");
      }
    }
  }
}

void configManager_setParameterExposeFlag(uint8_t parameterIndex) {
  parameterExposeFlags |= 1 << parameterIndex;
}

uint16_t configManager_getParameterExposeFlags() {
  if (overrideExposeFlags) {
    return parameterExposeFlagsOverride;
  }
  return parameterExposeFlags;
}

void configManager_setParameterExposeFlagsForBoardLeds() {
  configManager_setParameterExposeFlag(SystemParameter_HeartbeatLed);
  configManager_setParameterExposeFlag(SystemParameter_KeyHoldIndicatorLed);
}

void configManager_addParameterChangeListener(ParameterChangedListener listener) {
  if (utils_checkPointerArrayIncludes((void **)parameterChangedListeners, numParameterChangedListeners, listener)) {
    return;
  }
  parameterChangedListeners[numParameterChangedListeners++] = listener;
}

void configManager_overrideParameterMaxValue(uint8_t parameterIndex, uint8_t value) {
  uint8_t *pMaxValues = (uint8_t *)&systemParameterMaxValues;
  pMaxValues[parameterIndex] = value;
}

bool validateParameter(uint8_t parameterIndex, uint8_t value) {
  uint8_t min = 0;
  uint8_t max = ((uint8_t *)&systemParameterMaxValues)[parameterIndex];
  return utils_inRange(value, min, max);
}

void fixSystemParametersLoaded() {
  for (int i = 0; i < NumSystemParameters; i++) {
    uint8_t value = systemParameterValues[i];
    if (!validateParameter(i, value)) {
      uint8_t defaultValue = ((uint8_t *)&systemParametersDefault)[i];
      systemParameterValues[i] = defaultValue;
      printf("system parameter value fixed %d, %d --> %d\n", i, value, defaultValue);
    }
  }
}

void writeParameter(uint8_t parameterIndex, uint8_t value) {
  if (validateParameter(parameterIndex, value)) {
    systemParameterValues[parameterIndex] = value;
    reserveParameterChangedNotification(parameterIndex);
    reserveLazySave();
  }
}

void writeParameterWuthoutNotification(uint8_t parameterIndex, uint8_t value) {
  if (validateParameter(parameterIndex, value)) {
    systemParameterValues[parameterIndex] = value;
    reserveLazySave();
  }
}

void configManager_initialize() {
  addrSystemParameters = dataStorage_getDataAddress_systemParameters();

  if (addrSystemParameters) {
    uint16_t addrParametersRevision = dataStorage_getDataAddress_storageSystemParametersRevision();
    if (addrParametersRevision) {
      uint8_t parametersRevision = dataMemory_readByte(addrParametersRevision);
      if (parametersRevision != Kermite_ConfigParametersRevision) {
        dataMemory_writeBytes(addrSystemParameters, (uint8_t *)&systemParametersDefault, NumSystemParameters);
        dataMemory_writeByte(addrParametersRevision, Kermite_ConfigParametersRevision);
        printf("system parameters initialized\n");
      }
    }
    dataMemory_readBytes(addrSystemParameters, systemParameterValues, NumSystemParameters);
    fixSystemParametersLoaded();
    reseverAllParameterChangedNotification();
  }
}

void configManager_readSystemParameterValues(uint8_t *buf, uint8_t len) {
  utils_copyBytes(buf, systemParameterValues, len);
}

void configManager_readSystemParameterMaxValues(uint8_t *buf, uint8_t len) {
  utils_copyBytes(buf, (uint8_t *)&systemParameterMaxValues, len);
}

uint8_t configManager_readParameter(uint8_t parameterIndex) {
  return systemParameterValues[parameterIndex];
}

void configManager_writeParameter(uint8_t parameterIndex, uint8_t value) {
  writeParameter(parameterIndex, value);
}

void configManager_bulkWriteParameters(uint8_t *buf, uint8_t len, uint8_t parameterIndexBase) {
  for (int i = 0; i < len; i++) {
    uint8_t value = buf[i];
    writeParameterWuthoutNotification(i, value);
  }
  reseverAllParameterChangedNotification();
}

void configManager_resetSystemParameters() {
  uint8_t *pDefaultValues = (uint8_t *)&systemParametersDefault;
  for (int i = 0; i < NumSystemParameters; i++) {
    uint8_t value = pDefaultValues[i];
    writeParameterWuthoutNotification(i, value);
  }
  reseverAllParameterChangedNotification();
}

static void shiftParameter(uint8_t parameterIndex, int dir, bool roll) {
  uint8_t maxValue = ((uint8_t *)&systemParameterMaxValues)[parameterIndex];
  int16_t oldValue = systemParameterValues[parameterIndex];
  int16_t newValue;
  if (roll) {
    int16_t n = maxValue + 1;
    newValue = (oldValue + dir + n) % n;
  } else {
    newValue = utils_clamp(oldValue + dir, 0, maxValue);
  }
  if (newValue != oldValue) {
    configManager_writeParameter(parameterIndex, (uint8_t)newValue);
  }
}

void configManager_handleSystemAction(uint8_t code, uint8_t payloadValue) {
  // printf("handle system action %d %d\n", code, payloadValue);
  if (code == SystemAction_GlowToggle) {
    uint8_t isOn = systemParameterValues[SystemParameter_GlowActive];
    writeParameter(SystemParameter_GlowActive, isOn ^ 1);
  }
  if (code == SystemAction_GlowPatternRoll) {
    shiftParameter(SystemParameter_GlowPattern, 1, true);
  }
  if (code == SystemAction_GlowColorPrev) {
    shiftParameter(SystemParameter_GlowColor, -1, true);
  }
  if (code == SystemAction_GlowColorNext) {
    shiftParameter(SystemParameter_GlowColor, 1, true);
  }
  if (code == SystemAction_GlowBrightnessMinus) {
    shiftParameter(SystemParameter_GlowBrightness, -16, false);
  }
  if (code == SystemAction_GlowBrightnessPlus) {
    shiftParameter(SystemParameter_GlowBrightness, 16, false);
  }
  if (code == SystemAction_ResetToDfuMode) {
    reqRestToDfu = true;
  }
  if (code == SystemAction_SystemLayoutSetPrimary) {
    writeParameter(SystemParameter_SystemLayout, 0);
  }
  if (code == SystemAction_SystemLayoutSetSecondary) {
    writeParameter(SystemParameter_SystemLayout, 1);
  }
  if (code == SystemAction_SystemLayoutNext) {
    shiftParameter(SystemParameter_SystemLayout, 1, true);
  }
  if (code == SystemAction_RoutingChannelSetMain) {
    writeParameter(SystemParameter_WiringMode, 0);
  }
  if (code == SystemAction_RoutingChannelSetAlter) {
    writeParameter(SystemParameter_WiringMode, 1);
  }
  if (code == SystemAction_RoutingChannelNext) {
    shiftParameter(SystemParameter_WiringMode, 1, true);
  }
}

void configManager_processUpdate() {
  taskLazySave();
  taskChangedParameterNotification();
  if (reqRestToDfu) {
    reqRestToDfu = false;
    system_jumpToDfuBootloader();
  }
}

void configManager_processUpdateNoSave() {
  taskChangedParameterNotification();
}

uint8_t *configManager_getParameterValuesRawPointer() {
  return systemParameterValues;
}

void configManager_dispatchSingleParameterChangedEventsAll(
    void (*handler)(uint8_t eventType, uint8_t parameterIndex, uint8_t value)) {
  for (int i = 0; i < NumSystemParameters; i++) {
    handler(ParameterChangeEventType_ChangedSinle, i, systemParameterValues[i]);
  }
}
