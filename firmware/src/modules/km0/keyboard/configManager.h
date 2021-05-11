#ifndef __OPTION_MANAGER_H__
#define __OPTION_MANAGER_H__

#include "km0/types.h"

void configManager_addParameterChangeListener(
    void (*listener)(uint8_t parameterIndex, uint8_t value));
void configManager_initialize();
void configManager_setSystemParameter(uint8_t parameterIndex, uint8_t value);
void configManager_bulkWriteParameters(uint8_t *buf, uint8_t len, uint8_t parameterIndexBase);
void configManager_resetSystemParameters();
void configManager_handleSystemAction(uint8_t systemActionCode, uint8_t payloadValue);

void configManager_processUpdate();

#endif