#ifndef __KEY_INPUT_LOGIC_MODEL_H__
#define __KEY_INPUT_LOGIC_MODEL_H__

#include "types.h"

//16bit logicalKey
//0b_xxxx_MMMM_KKKK_KKKK
//MMMM: モディファイヤ, [OS, Alt, Shift, Ctrl] for [MSB-LSB]
//KKKK_KKKK: logical key code

//16bit hidKey
//0b_xxxx_MMMM_KKKK_KKKK
//MMMM: モディファイヤ, [OS, Alt, Shift, Ctrl] for [MSB-LSB]
//KKKK_KKKK: HID Key Usage

// typedef struct {
//   uint8_t key;
//   uint8_t modifiers;
// } LogicalKeySpec;

// typedef struct {
//   uint8_t key;
//   uint8_t modifiers;
// } HidKeySpec;

void keyInputLogicModel_initialize(
    bool isDualAssignMode,
    uint8_t numKeys,
    // uint8_t numLayers,
    void (*logicalKeyDestinationProc)(uint16_t logicalKey, bool isDown),
    uint16_t (*keyAssignsBufferReaderProc)(uint16_t assignWordIndex),
    void (*layerStateCallback)(uint8_t layerIndex));

void keyInputLogicModel_issuePhysicalKeyStateChanged(uint8_t keyIndex, bool isDown);

#endif