#ifndef __CONFIGURATOR_SERVANT_H__
#define __CONFIGURATOR_SERVANT_H__

#include "types.h"

#define ConfigStorageFormatRevision 2

enum {
  ConfiguratorServantState_KeyMemoryUpdationStarted = 1,
  ConfiguratorServentState_KeyMemoryUpdationDone = 2,
  ConfiguratorServentState_SideBrainModeEnabled = 10,
  ConfiguratorServentState_SideBrainModeDisabled = 11
};

void configuratorServant_initialize(
    uint8_t keyNum,
    void (*stateNotificationCallback)(uint8_t state));
void configuratorServant_processUpdate();
void configuratorServant_emitRealtimeKeyEvent(uint8_t keyIndex, bool isDown);
void configuratorServant_emitRelatimeLayerEvent(uint8_t layerIndex);

#endif