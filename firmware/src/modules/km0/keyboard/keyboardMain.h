#ifndef __KEYBOARD_MAIN_H__
#define __KEYBOARD_MAIN_H__

#include "km0/types.h"

typedef struct _KeyboardCallbackSet {
  void (*customParameterHandlerOverride)(uint8_t slotIndex, uint8_t value);
  void (*customParameterHandlerChained)(uint8_t slotIndex, uint8_t value);
  // void (*customCommandHandler)(uint8_t commandIndex);
  void (*layerStateChanged)(uint16_t layerStateFlags);
  void (*keyStateChanged)(uint8_t keyIndex, bool isDown);
} KeyboardCallbackSet;

extern bool optionEmitKeyStroke;
extern bool optionEmitRealtimeEvents;
extern bool optionAffectKeyHoldStateToLed;
extern bool optionUseHeartbeatLed;
extern bool optionInvertSide;
extern uint8_t pressedKeyCount;

void keyboardMain_useIndicatorLeds(int8_t pin1, uint8_t pin2, bool invert);
void keyboardMain_useIndicatorRgbLed(int8_t pin);
void keyboardMain_useDebugUart(uint32_t baud);

void keyboardMain_useKeyScanner(void (*_keyScannerUpdateFunc)(uint8_t *keyStateBitFlags));
void keyboardMain_useKeyScannerExtra(void (*_keyScannerUpdateFunc)(uint8_t *keyStateBitFlags));
void keyboardMain_setKeyIndexTable(const int8_t *_scanIndexToKeyIndexMap);
void keyboardMain_useDisplayModule(void (*_displayModuleUpdateFunc)(void), uint8_t frameRate);
uint8_t *keyboardMain_getNextScanSlotStateFlags();

void keyboardMain_initialize();
void keyboardMain_udpateKeyScanners();
void keyboardMain_processKeyInputUpdate();
void keyboardMain_processUpdate(uint32_t tick);

#endif