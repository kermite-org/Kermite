#ifndef __CONFIGURATOR_SERVANT_H__
#define __CONFIGURATOR_SERVANT_H__

#include "km0/types.h"

enum {
  ConfiguratorServantState_KeyMemoryUpdationStarted = 1,
  ConfiguratorServentState_KeyMemoryUpdationDone = 2,
  ConfiguratorServentState_SimulatorModeEnabled = 10,
  ConfiguratorServentState_SimulatorModeDisabled = 11
};

void configuratorServant_initialize(
    void (*stateNotificationCallback)(uint8_t state));
void configuratorServant_processUpdate();
void configuratorServant_emitRealtimeKeyEvent(uint8_t keyIndex, bool isDown);
void configuratorServant_emitRelatimeLayerEvent(uint16_t layerFlags);

void configuratorServant_readDeviceInstanceCode(uint8_t *buffer);

#endif