#pragma once

#include "km0/types.h"

enum {
  ParameterChangeEventType_ChangedAll = 1,
  ParameterChangeEventType_ChangedSinle = 2
};

void configManager_setParameterExposeFlag(uint8_t parameterIndex);
uint16_t configManager_getParameterExposeFlags();

void configManager_setParameterExposeFlagsForBoardLeds();

void configManager_addParameterChangeListener(
    void (*listener)(uint8_t eventType, uint8_t parameterIndex, uint8_t value));
void configManager_overrideParameterMaxValue(uint8_t parameterIndex, uint8_t value);
void configManager_initialize();
void configManager_readSystemParameterValues(uint8_t *buf, uint8_t len);
void configManager_readSystemParameterMaxValues(uint8_t *buf, uint8_t len);
uint8_t configManager_readParameter(uint8_t parameterIndex);

void configManager_writeParameter(uint8_t parameterIndex, uint8_t value);
void configManager_bulkWriteParameters(uint8_t *buf, uint8_t len, uint8_t parameterIndexBase);
void configManager_resetSystemParameters();

void configManager_handleSystemAction(uint8_t systemActionCode, uint8_t payloadValue);
void configManager_processUpdate();
void configManager_processUpdateNoSave();

uint8_t *configManager_getParameterValuesRawPointer();

void configManager_dispatchSingleParameterChangedEventsAll(
    void (*handler)(uint8_t eventType, uint8_t parameterIndex, uint8_t value));
