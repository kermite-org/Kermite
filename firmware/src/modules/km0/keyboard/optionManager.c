#include "optionManager.h"
#include "dataStorage.h"
#include "km0/common/utils.h"
#include "km0/deviceIo/dataMemory.h"
#include "systemCommand.h"
#include <stdio.h>

typedef void (*ParameterChangedListener)(uint8_t parameterIndex, uint8_t value);

static uint8_t systemParameterValues[NumSystemParameters];
static uint16_t addrSystemParameters = 0;
static int lazySaveTick = -1;
static ParameterChangedListener parameterChangedListeners[4] = { 0 };
static int numParameterChangedListeners = 0;

static const T_SystemParametersSet systemParametersDefault = {
  .emitKeyStroke = true,
  .emitRealtimeEvents = true,
  .keyHoldLedOutput = true,
  .heartbeatLedOutput = true,
  .masterSide = 0,
  .secondSystemLayoutActive = false,
  .simulatorModeActive = false,
  .alterAssignsActive = false,
  .glowActive = false,
  .glowColor = 0,
  .glowBrightness = 20,
  .glowPattern = 0,
  .glowDirection = 1,
  .glowSpeed = 4,
};

static const T_SystemParametersSet systemParameterMaxValues = {
  .emitKeyStroke = 1,
  .emitRealtimeEvents = 1,
  .keyHoldLedOutput = 1,
  .heartbeatLedOutput = 1,
  .masterSide = 2,
  .secondSystemLayoutActive = 1,
  .simulatorModeActive = 1,
  .alterAssignsActive = 1,
  .glowActive = 1,
  .glowColor = 12,
  .glowBrightness = 255,
  .glowPattern = 10,
  .glowDirection = 1,
  .glowSpeed = 10,
};

// static const uint8_t systemParameterMaxValues[NumSystemParameters] = {
//   1,
//   1,
//   1,
//   1,
//   2, //master side
//   1,
//   1,
//   1,
//   12,  //glow color
//   255, //glow brightness
//   10,  //glow pattern
//   1,   //glow direction
//   10,  //glow speed
// };

static void notifyParameterChanged(uint8_t parameterIndex, uint8_t value) {
  for (int i = 0; i < numParameterChangedListeners; i++) {
    ParameterChangedListener listener = parameterChangedListeners[i];
    if (listener) {
      listener(parameterIndex, value);
    }
  }
}

void ontionManager_addParameterChangeListener(ParameterChangedListener listener) {
  parameterChangedListeners[numParameterChangedListeners++] = listener;
}

void optionManager_initialize() {
  addrSystemParameters = dataStorage_getDataAddress_systemParameters();

  if (addrSystemParameters) {
    uint16_t addrParameterInitializationFlag = dataStorage_getDataAddress_parametersInitializationFlag();
    if (addrParameterInitializationFlag) {
      bool isParametersInitialized = dataMemory_readByte(addrParameterInitializationFlag);
      if (!isParametersInitialized) {
        dataMemory_writeBytes(addrSystemParameters, (uint8_t *)&systemParametersDefault, NumSystemParameters);
        dataMemory_writeByte(addrParameterInitializationFlag, 1);
      }
    }

    dataMemory_readBytes(addrSystemParameters, systemParameterValues, NumSystemParameters);
    for (int bi = 0; bi < NumSystemParameters; bi++) {
      uint8_t parameterIndex = SystemParameterIndexBase + bi;
      notifyParameterChanged(parameterIndex, systemParameterValues[bi]);
    }
  }
}

void optionManager_setSystemParameter(uint8_t parameterIndex, uint8_t value) {
  uint8_t bi = parameterIndex - SystemParameterIndexBase;
  systemParameterValues[bi] = value;
  notifyParameterChanged(parameterIndex, value);
  lazySaveTick = 5000; //いずれかのパラメタが変更されてから5秒後にデータをストレージに書き込む
}

void optionManager_bulkWriteParameters(uint8_t *buf, uint8_t len, uint8_t parameterIndexBase) {
  for (int i = 0; i < len; i++) {
    uint8_t parameterIndex = parameterIndexBase + i;
    uint8_t value = buf[i];
    optionManager_setSystemParameter(parameterIndex, value);
  }
}

void optionManager_resetSystemParameters() {
  uint8_t *pDefaultValues = (uint8_t *)&systemParametersDefault;
  for (int i = 0; i < NumSystemParameters; i++) {
    uint8_t parameterIndex = SystemParameterIndexBase + i;
    uint8_t value = pDefaultValues[i];
    optionManager_setSystemParameter(parameterIndex, value);
  }
}

static void shiftParameterValue(uint8_t parameterIndex, uint8_t payloadValue) {
  int dir = (payloadValue & 0x0F == 1) ? 1 : -1;
  bool clamp = payloadValue >> 4 & 0x0F > 0;
  uint8_t bi = parameterIndex - SystemParameterIndexBase;

  bool maxValue = ((uint8_t *)&systemParameterMaxValues)[bi];
  int oldValue = systemParameterValues[bi];
  int newValue;
  if (!clamp) {
    newValue = (oldValue + dir + maxValue) % maxValue;
  } else {
    newValue = utils_clamp(oldValue + dir, 0, maxValue);
  }
  if (newValue != oldValue) {
    optionManager_setSystemParameter(parameterIndex, (uint8_t)newValue);
  }
}

void optionManager_handleSystemAction(uint8_t systemActionCode, uint8_t payloadValue) {
  if (100 <= systemActionCode && systemActionCode < (100 + NumSystemParameters)) {
    uint8_t parameterIndex = systemActionCode;
    optionManager_setSystemParameter(parameterIndex, payloadValue);
  }
  if (150 <= systemActionCode && systemActionCode < (150 + 5)) {
    uint8_t parameterIndex = systemActionCode - 50 + 9;
    shiftParameterValue(parameterIndex, payloadValue);
  }
}

void optionManager_processUpdate() {
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
