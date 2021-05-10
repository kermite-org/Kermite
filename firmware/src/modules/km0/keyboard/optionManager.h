#ifndef __OPTION_MANAGER_H__
#define __OPTION_MANAGER_H__

#include "km0/types.h"

void ontionManager_addParameterChangeListener(
    void (*listener)(uint8_t parameterIndex, uint8_t value));
void optionManager_initialize();
void optionManager_setSystemParameter(uint8_t parameterIndex, uint8_t value);
void optionManager_bulkWriteParameters(uint8_t *buf, uint8_t len, uint8_t parameterIndexBase);
void optionManager_resetSystemParameters();
void optionManager_handleSystemAction(uint8_t systemActionCode, uint8_t payloadValue);

void optionManager_processUpdate();

#endif