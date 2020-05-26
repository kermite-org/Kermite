#include "keyInputLogicModel.h"
#include "KeyAssignDefinitions.h"

//#include "ConfigurationMemoryReader.h"

#if 1
#include <stdio.h>
#endif

//------------------------------------------------------------

//#define NumBytesPerAssign 2

typedef struct {
  //props
  bool initialized;
  bool isDualAssignMode;
  uint8_t numKeys;
  // uint8_t numLayers;
  //論理キーの送信先
  void (*logicalKeyDestinationProc)(uint16_t logicalKey, bool isDown);

  //相対アドレス指定でキーアサインメモリから2バイト読んで返す関数
  uint16_t (*keyAssignsBufferReaderProc)(uint16_t assignWordIndex);

  void (*layerStateCallback)(uint8_t layerIndex);

  //state
  uint8_t curLayer;

  uint16_t boundLogicalKeys[128];
} Local;

Local local;

//------------------------------------------------------------

static uint16_t getKeyAssignWordIndex(uint8_t keyIndex, uint8_t layerIndex, uint8_t slotIndex) {
  if (local.isDualAssignMode) {
    return ((layerIndex * local.numKeys + keyIndex) * 2 + slotIndex);
  } else {
    return (layerIndex * local.numKeys + keyIndex);
  }
}

//------------------------------------------------------------

void keyInputLogicModel_initialize(
    bool isDualAssignMode,
    uint8_t numKeys,
    // uint8_t numLayers,
    void (*logicalKeyDestinationProc)(uint16_t logicalKey, bool isDown),
    uint16_t (*keyAssignsBufferReaderProc)(uint16_t assignWordIndex),
    void (*layerStateCallback)(uint8_t layerIndex)) {
  local.isDualAssignMode = isDualAssignMode;
  local.numKeys = numKeys;
  // local.numLayers = numLayers;
  local.logicalKeyDestinationProc = logicalKeyDestinationProc;
  local.keyAssignsBufferReaderProc = keyAssignsBufferReaderProc;
  local.layerStateCallback = layerStateCallback;
  local.initialized = true;
  local.curLayer = Layer_Main;

  for (uint8_t i = 0; i < 128; i++) {
    local.boundLogicalKeys[i] = 0;
  }

  //configurationMemoryReader_initialize(numKeys);
}

void keyInputLogicModel_issuePhysicalKeyStateChanged(uint8_t keyIndex, bool isDown) {
  if (!local.initialized) {
    return;
  }

  uint16_t assignWordIndex = getKeyAssignWordIndex(keyIndex, local.curLayer, 0);
  uint16_t assign = local.keyAssignsBufferReaderProc(assignWordIndex);
  //uint16_t assign = configurationMemoryReader_readKeyAssignMemoryWord(assignWordIndex);

  if (assign == 0) {
    assignWordIndex = getKeyAssignWordIndex(keyIndex, Layer_Global, 0);
    assign = local.keyAssignsBufferReaderProc(assignWordIndex);
    //assign = configurationMemoryReader_readKeyAssignMemoryWord(assignWordIndex);
  }
  // printf("assignWordIndex: %d, assign: %d\n", assignWordIndex, assign);

  if (assign == 0) {
    return;
  }

  uint8_t assignType = assign >> 14 & 0b1;
  uint8_t trigger = assign >> 12 & 0b11;
  // printf("assignType: %d, trigger: %d\n", assignType, trigger);
  if (assignType == AssignType_KeyInput) {
    uint16_t logicalKey = assign & 0x0FFF;
    if (logicalKey > 0) {
      if (trigger == TrKeyDown) {
        if (isDown) {
          local.logicalKeyDestinationProc(logicalKey, true);
          local.boundLogicalKeys[keyIndex] = logicalKey;
        } else {
          uint16_t boundLogicalKey = local.boundLogicalKeys[keyIndex];
          if (boundLogicalKey) {
            local.logicalKeyDestinationProc(boundLogicalKey, false);
            local.boundLogicalKeys[keyIndex] = 0;
          }
        }
      }
    }
  } else if (assignType == AssignType_LayerInvocation) {
    uint8_t operation = assign >> 8 & 0b111;
    uint8_t targetLayer = assign & 0b1111;
    //内部状態を更新
    if (targetLayer != Layer_NoAssign) {
      if (trigger == TrKeyDown) {
        if (operation == OpHoldLayer) {
          if (isDown) {
            local.curLayer = targetLayer;
            local.layerStateCallback(targetLayer);
          } else {
            local.curLayer = Layer_Main;
            local.layerStateCallback(Layer_Main);
          }
        }
      }
    }
  }
}