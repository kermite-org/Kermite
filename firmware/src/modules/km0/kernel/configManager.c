#include "configManager.h"
#include "commandDefinitions.h"
#include "dataStorage.h"
#include "km0/base/bitOperations.h"
#include "km0/base/utils.h"
#include "km0/device/dataMemory.h"
#include <stdio.h>

typedef void (*ParameterChangedListener)(uint8_t parameterIndex, uint8_t value);

static uint8_t systemParameterValues[NumSystemParameters];
static uint16_t addrSystemParameters = 0;
static int lazySaveTick = -1;
static ParameterChangedListener parameterChangedListeners[4] = { 0 };
static int numParameterChangedListeners = 0;

static uint16_t parameterChangedFlags = 0;

static const T_SystemParametersSet systemParametersDefault = {
  .emitKeyStroke = true,
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
  .glowDirection = 1,
  .glowSpeed = 4,
};

static T_SystemParametersSet systemParameterMaxValues = {
  .emitKeyStroke = 1,
  .emitRealtimeEvents = 1,
  .keyHoldLedOutput = 1,
  .heartbeatLedOutput = 1,
  .masterSide = 1,
  .systemLayout = 2,
  .wiringMode = 1,
  .glowActive = 1,
  .glowColor = 255,
  .glowBrightness = 255,
  .glowPattern = 255,
  .glowDirection = 1,
  .glowSpeed = 10,
};

static void notifyParameterChanged(uint8_t parameterIndex, uint8_t value) {
  for (int i = 0; i < numParameterChangedListeners; i++) {
    ParameterChangedListener listener = parameterChangedListeners[i];
    listener(parameterIndex, value);
  }
}

static void taskChangedParameterNotification() {
  for (int i = 0; i < NumSystemParameters; i++) {
    if (bit_is_on(parameterChangedFlags, i)) {
      notifyParameterChanged(i, systemParameterValues[i]);
      bit_off(parameterChangedFlags, i);
    }
  }
}

static void reserveParameterChangedNotification(uint8_t parameterIndex) {
  bit_on(parameterChangedFlags, parameterIndex);
}

static void reserveLazySave() {
  lazySaveTick = 3000; //およそ3秒後にデータをストレージに書き込む
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
  if (parameterIndex == SystemParameter_SystemLayout) {
    min = 1;
  }
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

void configManager_initialize() {
  addrSystemParameters = dataStorage_getDataAddress_systemParameters();

  if (addrSystemParameters) {
    uint16_t addrParameterInitializationFlag = dataStorage_getDataAddress_parametersInitializationFlag();
    if (addrParameterInitializationFlag) {
      bool isParametersInitialized = dataMemory_readByte(addrParameterInitializationFlag);
      if (!isParametersInitialized) {
        dataMemory_writeBytes(addrSystemParameters, (uint8_t *)&systemParametersDefault, NumSystemParameters);
        dataMemory_writeByte(addrParameterInitializationFlag, 1);
        printf("system parameters initialized\n");
      }
    }

    dataMemory_readBytes(addrSystemParameters, systemParameterValues, NumSystemParameters);
    fixSystemParametersLoaded();
    for (int i = 0; i < NumSystemParameters; i++) {
      reserveParameterChangedNotification(i);
    }
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
    configManager_writeParameter(i, value);
  }
}

void configManager_resetSystemParameters() {
  uint8_t *pDefaultValues = (uint8_t *)&systemParametersDefault;
  for (int i = 0; i < NumSystemParameters; i++) {
    uint8_t value = pDefaultValues[i];
    configManager_writeParameter(i, value);
  }
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
}

void configManager_processUpdate() {
  taskLazySave();
  taskChangedParameterNotification();
}

void configManager_processUpdateNoSave() {
  taskChangedParameterNotification();
}

uint8_t *configManager_getParameterValuesRawPointer() {
  return systemParameterValues;
}