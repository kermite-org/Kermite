#ifndef __KEYBOARD_MAIN_INTERNAL_H__
#define __KEYBOARD_MAIN_INTERNAL_H__

#include "km0/types.h"

typedef struct {
  void (*customParameterHandlerOverride)(uint8_t slotIndex, uint8_t value);
  void (*customParameterHandlerExtended)(uint8_t slotIndex, uint8_t value);
  // void (*customCommandHandler)(uint8_t commandIndex);
  void (*layerStateChanged)(uint16_t layerStateFlags);
  void (*keyStateChanged)(uint8_t keyIndex, bool isDown);
} KeyboardCallbackSet;

#define KEYINDEX_NONE 255

typedef struct {
  uint16_t layerStateFlags;
  const uint8_t *hidReportBuf;
  uint8_t pressedKeyIndex;
  bool isSplitSlave;
  bool optionInvertSide;
} KeyboardMainExposedState;

extern KeyboardMainExposedState keyboardMain_exposedState;
uint8_t *keyboardMain_getNextScanSlotStateFlags();

void keyboardMain_setAsSplitSlave();
void keyboardMain_setCallbacks(KeyboardCallbackSet *_callbacks);
void keyboardMain_initialize();
void keyboardMain_udpateKeyScanners();
void keyboardMain_processKeyInputUpdate(uint8_t tickInterval);
void keyboardMain_updateKeyInidicatorLed();
void keyboardMain_updateDisplayModules(uint32_t tick);
void keyboardMain_updateHeartBeatLed(uint32_t tick);
void keyboardMain_processUpdate();

#endif