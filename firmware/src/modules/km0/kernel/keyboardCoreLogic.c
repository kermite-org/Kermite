#include "keyboardCoreLogic.h"
#include "configManager.h"
#include "dataStorage.h"
#include "keyActionRemapper.h"
#include "keyCodeTranslator.h"
#include "keyCodes.h"
#include "km0/base/bitOperations.h"
#include "km0/base/configImport.h"
#include "km0/base/utils.h"
#include "km0/device/dataMemory.h"
#include <stdio.h>

/*
software/src/shell/services/keyboardLogic/inputLogicSimulatorD/KeyboardCoreLogicImplementation.ts
プロトタイプ/シミュレータ実装のコードを元にC言語に移植
*/

//--------------------------------------------------------------------------------
//assing memory storage

static uint8_t readStorageByte(uint16_t addr) {
  return dataMemory_readByte(addr);
}

static uint16_t readStorageWordBE(uint16_t addr) {
  uint8_t a = dataMemory_readByte(addr);
  uint8_t b = dataMemory_readByte(addr + 1);
  return a << 8 | b;
}

//--------------------------------------------------------------------------------
// execution options

typedef struct {
  uint8_t systemLayout;
  uint8_t wiringMode;
} LogicOptions;

LogicOptions logicOptions = {
  .systemLayout = 0,
  .wiringMode = 0
};

void setSystemLayout(uint8_t layout) {
  logicOptions.systemLayout = layout;
}

void setWiringMode(uint8_t mode) {
  logicOptions.wiringMode = mode;
}

//--------------------------------------------------------------------------------
//hid report

enum {
  ModFlag_Ctrl = 1,
  ModFlag_Shift = 2,
  ModFlag_Alt = 4,
  ModFlag_OS = 8
};

#define NumHidReportBytes 8
#define NumHidHoldKeySlots 6

typedef struct {
  uint8_t hidReportBuf[NumHidReportBytes];
  uint8_t modCounts[4];
  uint8_t shiftCancelCount;
  uint8_t hidKeyCodes[NumHidHoldKeySlots];
  uint8_t nextKeyPos;
} HidReportState;

static HidReportState hidReportState;

static uint8_t getModFlagsFromModCounts() {
  HidReportState *rs = &hidReportState;
  uint8_t modFlags = 0;
  for (int i = 0; i < 4; i++) {
    if (rs->modCounts[i] > 0) {
      modFlags |= 1 << i;
    }
  }
  return modFlags;
}

static void resetHidReportState() {
  HidReportState *rs = &hidReportState;
  for (uint8_t i = 0; i < NumHidReportBytes; i++) {
    rs->hidReportBuf[i] = 0;
  }
  for (uint8_t i = 0; i < 4; i++) {
    rs->modCounts[i] = 0;
  }
  rs->shiftCancelCount = 0;
  for (uint8_t i = 0; i < NumHidHoldKeySlots; i++) {
    rs->hidKeyCodes[i] = 0;
  }
  rs->nextKeyPos = 0;
}

static uint8_t *getOutputHidReport() {
  HidReportState *rs = &hidReportState;
  uint8_t modifiers = getModFlagsFromModCounts();
  if (modifiers == 0b0010 && rs->shiftCancelCount > 0) {
    modifiers = 0;
  }
  rs->hidReportBuf[0] = modifiers;
  for (uint8_t i = 0; i < NumHidHoldKeySlots; i++) {
    rs->hidReportBuf[i + 2] = rs->hidKeyCodes[i];
  }
  return rs->hidReportBuf;
}

static uint8_t *getOutputHidReportZeros() {
  utils_fillBytes(hidReportState.hidReportBuf, 0, 8);
  return hidReportState.hidReportBuf;
}

static void setModifiers(uint8_t modFlags) {
  HidReportState *rs = &hidReportState;
  for (int i = 0; i < 4; i++) {
    if (((modFlags >> i) & 1) > 0) {
      rs->modCounts[i]++;
    }
  }
}

static void clearModifiers(uint8_t modFlags) {
  HidReportState *rs = &hidReportState;
  for (int i = 0; i < 4; i++) {
    if (((modFlags >> i) & 1) > 0 && rs->modCounts[i] > 0) {
      rs->modCounts[i]--;
    }
  }
}

static uint8_t rollNextKeyPos() {
  HidReportState *rs = &hidReportState;
  for (uint8_t i = 0; i < NumHidHoldKeySlots; i++) {
    rs->nextKeyPos++;
    if (rs->nextKeyPos == NumHidHoldKeySlots) {
      rs->nextKeyPos = 0;
    }
    if (rs->hidKeyCodes[rs->nextKeyPos] == 0) {
      break;
    }
  }
  return rs->nextKeyPos;
}

static void pushOutputKeyCode(uint8_t hidKeyCode) {
  uint8_t pos = rollNextKeyPos();
  hidReportState.hidKeyCodes[pos] = hidKeyCode;
}

static void removeOutputKeyCode(uint8_t hidKeyCode) {
  HidReportState *rs = &hidReportState;
  for (uint8_t i = 0; i < NumHidHoldKeySlots; i++) {
    if (rs->hidKeyCodes[i] == hidKeyCode) {
      rs->hidKeyCodes[i] = 0;
      break;
    }
  }
}

static void startShiftCancel() {
  hidReportState.shiftCancelCount++;
}

static void endShiftCancel() {
  if (hidReportState.shiftCancelCount > 0) {
    hidReportState.shiftCancelCount--;
  }
}

// --------------------------------------------------------------------------------
// key stroke action queue
typedef struct {
  bool isDown : 1;
  bool shiftCancel : 1;
  uint8_t reserved : 2;
  uint8_t modFlags : 4;
  uint8_t hidKeyCode;
} OutputKeyStrokeAction;

#define OutputActionQueueSize 8
#define OutputActionQueueIndexMask 7

typedef struct {
  OutputKeyStrokeAction buffer[OutputActionQueueSize];
  uint8_t writePos;
  uint8_t readPos;
} KeyStrokeActionQueueState;

static KeyStrokeActionQueueState keyStrokeActionQueueState;

static void keyStrokeActionQueue_enqueueActionRaw(OutputKeyStrokeAction action) {
  uint8_t size = OutputActionQueueSize;
  uint8_t mask = OutputActionQueueIndexMask;
  KeyStrokeActionQueueState *qs = &keyStrokeActionQueueState;
  uint8_t count = (qs->writePos - qs->readPos + size) & mask;
  if (count < OutputActionQueueSize) {
    qs->buffer[qs->writePos] = action;
    qs->writePos = (qs->writePos + 1) & mask;
  }
}

static void keyStrokeActionQueue_enqueueAction(OutputKeyStrokeAction action) {
  if (action.shiftCancel > 0 || action.modFlags > 0) {
    OutputKeyStrokeAction modAction = {
      isDown : action.isDown,
      shiftCancel : action.shiftCancel,
      modFlags : action.modFlags,
    };
    keyStrokeActionQueue_enqueueActionRaw(modAction);
  }
  if (action.hidKeyCode > 0) {
    OutputKeyStrokeAction keyAction = {
      isDown : action.isDown,
      hidKeyCode : action.hidKeyCode,
    };
    keyStrokeActionQueue_enqueueActionRaw(keyAction);
  }
}

static void keyStrokeActionQueue_executeAction(OutputKeyStrokeAction action) {
  if (action.isDown) {
    if (action.shiftCancel) {
      startShiftCancel();
    }
    setModifiers(action.modFlags);
    if (action.hidKeyCode) {
      pushOutputKeyCode(action.hidKeyCode);
    }
  } else {
    if (action.shiftCancel) {
      endShiftCancel();
    }
    clearModifiers(action.modFlags);
    if (action.hidKeyCode) {
      removeOutputKeyCode(action.hidKeyCode);
    }
  }
}

static void keyStrokeActionQueue_shiftQueuedActionOne() {
  uint8_t size = OutputActionQueueSize;
  uint8_t mask = OutputActionQueueIndexMask;
  KeyStrokeActionQueueState *qs = &keyStrokeActionQueueState;
  uint8_t count = (qs->writePos - qs->readPos + size) & mask;
  if (count > 0) {
    OutputKeyStrokeAction action = qs->buffer[qs->readPos];
    qs->readPos = (qs->readPos + 1) & mask;
    keyStrokeActionQueue_executeAction(action);
  }
}

//--------------------------------------------------------------------------------
//assing memory reader

#define NumLayersMax 16
typedef struct {
  uint8_t numLayers;
  uint16_t assignsStartAddress;
  uint16_t assignsEndAddress;
  uint16_t layerAttributeWords[NumLayersMax];
} AssignMemoryReaderState;

typedef struct {
  uint8_t shiftCancelMode;
  uint16_t tapHoldThresholdMs;
  bool useInterruptHold;
} LogicConfig;

static AssignMemoryReaderState assignMemoryReaderState;

static LogicConfig logicConfig;

static void initAssignMemoryReader() {
  AssignMemoryReaderState *rs = &assignMemoryReaderState;

  uint16_t profileHeaderLocation = dataStorage_getDataAddress_profileData_profileHeader();
  uint8_t numLayers = readStorageByte(profileHeaderLocation + 4);
  rs->numLayers = numLayers;

  uint16_t keyMappingDataLocation = dataStorage_getDataAddress_profileData_keyAssigns();
  uint16_t keyMappingDataSize = dataStorage_getDataSize_profileData_keyAssigns();
  rs->assignsStartAddress = keyMappingDataLocation;
  rs->assignsEndAddress = keyMappingDataLocation + keyMappingDataSize;
  printf("numLayers:%d keyMappingDataSize:%d\n", numLayers, keyMappingDataSize);

  uint16_t layerListDataLocation = dataStorage_getDataAddress_profileData_layerList();
  for (uint8_t i = 0; i < 16; i++) {
    rs->layerAttributeWords[i] = (i < numLayers) ? readStorageWordBE(layerListDataLocation + i * 2) : 0;
  }

  uint16_t profileSettingsLocation = dataStorage_getDataAddress_profileData_profileSettings();
  logicConfig.shiftCancelMode = readStorageByte(profileSettingsLocation + 0);
  logicConfig.tapHoldThresholdMs = readStorageWordBE(profileSettingsLocation + 1);
  logicConfig.useInterruptHold = readStorageByte(profileSettingsLocation + 3) > 0;

  keyActionRemapper_setupDataReader();
}

static uint8_t getNumLayers() {
  return assignMemoryReaderState.numLayers;
}

static bool isLayerDefaultSchemeBlock(uint8_t layerIndex) {
  uint16_t attrWord = assignMemoryReaderState.layerAttributeWords[layerIndex];
  return ((attrWord >> 15) & 1) == 1;
}

static uint8_t getLayerAttachedModifiers(uint8_t layerIndex) {
  uint16_t attrWord = assignMemoryReaderState.layerAttributeWords[layerIndex];
  return (attrWord >> 8) & 0b1111;
}

static bool getLayerInitialActive(uint8_t layerIndex) {
  uint16_t attrWord = assignMemoryReaderState.layerAttributeWords[layerIndex];
  return ((attrWord >> 13) & 1) == 1;
}

static uint8_t getLayerExclusionGroup(uint8_t layerIndex) {
  uint16_t attrWord = assignMemoryReaderState.layerAttributeWords[layerIndex];
  return attrWord & 0b111;
}

static uint16_t getAssignsBlockAddressForKey(uint8_t targetKeyIndex) {
  uint16_t addr = assignMemoryReaderState.assignsStartAddress;
  while (addr < assignMemoryReaderState.assignsEndAddress) {
    uint16_t data = readStorageWordBE(addr);
    bool fIsAssign = ((data >> 15) & 1) > 0;
    uint8_t fBodyLength = (data >> 8) & 0x7f;
    uint8_t fKeyIndex = data & 0xff;

    if (!fIsAssign) {
      break;
    }
    if (fKeyIndex == targetKeyIndex) {
      return addr;
    }
    addr += 2;
    addr += fBodyLength;
  }
  return 0;
}

enum {
  AssignType_None = 0,
  AssignType_Single = 1,
  AssignType_Dual = 2,
  AssignType_Tri = 3,
  AssignType_Block = 4,
  AssignType_Transparent = 5,
};

static uint8_t decodeOperationWordsLength(uint8_t code) {
  uint8_t szPri = ((code >> 6) & 0b11) + 1;
  uint8_t szSec = (code >> 3) & 0b111;
  uint8_t szTer = code & 0b111;
  return szPri + szSec + szTer;
}

static void decodeOperationWordLengths(uint8_t code, uint8_t *szPri, uint8_t *szSec, uint8_t *szTer) {
  *szPri = ((code >> 6) & 0b11) + 1;
  *szSec = (code >> 3) & 0b111;
  *szTer = code & 0b111;
}

static uint16_t getAssignBlockAddressForLayer(uint16_t baseAddr, uint8_t targetLayerIndex) {
  uint8_t len = readStorageByte(baseAddr) & 0x7F;
  uint16_t addr = baseAddr + 2;
  uint16_t endPos = addr + len;
  while (addr < endPos) {
    uint8_t data = readStorageByte(addr);
    uint8_t layerIndex = data & 0b1111;
    if (layerIndex == targetLayerIndex) {
      return addr;
    }
    addr++;
    uint8_t assignType = data >> 4 & 0b111;
    uint8_t numBlockBytes = 0;
    if (
        assignType == AssignType_Single ||
        assignType == AssignType_Dual ||
        assignType == AssignType_Tri) {
      uint8_t secondByte = readStorageByte(addr);
      numBlockBytes = decodeOperationWordsLength(secondByte);
      addr++;
    }
    addr += numBlockBytes;
  }
  return 0;
}

typedef struct {
  uint8_t assignType;
  uint32_t pri;
  uint32_t sec;
  uint32_t ter;
  int8_t layerIndex;
} AssignSet;

static AssignSet assignSetRes;

static uint32_t readOperationWordVL4(uint16_t addr, uint8_t sz) {
  uint32_t word = 0;
  for (uint8_t i = 0; i < sz; i++) {
    word = (word << 8) | readStorageByte(addr++);
  }
  for (uint8_t i = 0; i < 4 - sz; i++) {
    word <<= 8;
  }
  return word;
}

static AssignSet *getAssignSetInLayer(uint8_t keyIndex, uint8_t layerIndex) {
  uint16_t addr0 = getAssignsBlockAddressForKey(keyIndex);
  if (addr0 > 0) {
    uint16_t addr1 = getAssignBlockAddressForLayer(addr0, layerIndex);
    if (addr1 > 0) {
      uint8_t entryHeaderByte = readStorageByte(addr1);
      uint8_t assignType = entryHeaderByte >> 4 & 0b111;
      bool isBlock = assignType == 4;
      bool isTrans = assignType == 5;
      if (isBlock || isTrans) {
        assignSetRes.assignType = assignType;
        assignSetRes.pri = 0;
        assignSetRes.sec = 0;
        assignSetRes.ter = 0;
        assignSetRes.layerIndex = -1;
        return &assignSetRes;
      }
      bool isDual = assignType == 2;
      bool isTriple = assignType == 3;

      uint8_t sz0, sz1, sz2;
      uint8_t secondByte = readStorageByte(addr1 + 1);
      decodeOperationWordLengths(secondByte, &sz0, &sz1, &sz2);
      uint16_t pos = addr1 + 2;

      uint32_t pri = readOperationWordVL4(pos, sz0);
      uint32_t sec =
          (isDual || isTriple) ? readOperationWordVL4(pos + sz0, sz1) : 0;
      uint32_t ter = isTriple
                         ? readOperationWordVL4(pos + sz0 + sz1, sz2)
                         : 0;
      assignSetRes.assignType = assignType;
      assignSetRes.pri = pri;
      assignSetRes.sec = sec;
      assignSetRes.ter = ter;
      assignSetRes.layerIndex = layerIndex;
      return &assignSetRes;
    }
  }
  return NULL;
}

static AssignSet *findAssignInLayerStack(uint8_t keyIndex, uint16_t layerActiveFlags) {
  for (int8_t i = 15; i >= 0; i--) {
    if ((layerActiveFlags >> i) & 1) {
      AssignSet *res = getAssignSetInLayer(keyIndex, i);
      bool isDefaultSchemeBlock = isLayerDefaultSchemeBlock(i);
      if (res && res->assignType == AssignType_Transparent) {
        continue;
      }
      if (res && res->assignType == AssignType_Block) {
        return NULL;
      }
      if (!res && isDefaultSchemeBlock) {
        return NULL;
      }
      if (res && res->assignType != AssignType_None) {
        return res;
      }
    }
  }
  return NULL;
}

//--------------------------------------------------------------------------------
//operation handlers

typedef struct {
  uint16_t layerActiveFlags;
  int8_t oneshotLayerIndex;
  int8_t oneshotCancelTick;
} LayerState;

static LayerState layerState;

static void resetLayerState() {
  layerState.layerActiveFlags = 0;
  uint8_t numLayers = getNumLayers();
  for (uint8_t i = 0; i < numLayers; i++) {
    bool initialActive = getLayerInitialActive(i);
    if (initialActive) {
      layerState.layerActiveFlags |= 1 << i;
    }
  }
  layerState.oneshotLayerIndex = -1;
  layerState.oneshotCancelTick = -1;
}

static uint16_t getLayerActiveFlags() {
  return layerState.layerActiveFlags;
}

static void layerMutations_clearExclusive(uint8_t targetExclusiveGroup, int8_t skipLayerIndex);

static bool layerMutations_isActive(uint8_t layerIndex) {
  return ((layerState.layerActiveFlags >> layerIndex) & 1) > 0;
}

static void layerMutations_turnOffSiblingLayersIfNeed(uint8_t layerIndex) {
  uint8_t targetExclusionGroup = getLayerExclusionGroup(layerIndex);
  if (targetExclusionGroup != 0) {
    layerMutations_clearExclusive(targetExclusionGroup, layerIndex);
  }
}

static OutputKeyStrokeAction createLayerModifierOutputAction(
    uint8_t modifiers,
    bool isDown) {
  OutputKeyStrokeAction action = {
    isDown : isDown,
    shiftCancel : 0,
    reserved : 0,
    modFlags : modifiers,
    hidKeyCode : 0,
  };
  return action;
}

static void layerMutations_activate(uint8_t layerIndex) {
  if (!layerMutations_isActive(layerIndex)) {
    layerMutations_turnOffSiblingLayersIfNeed(layerIndex);
    layerState.layerActiveFlags |= 1 << layerIndex;
    // console.log(state.layerHoldFlags.map((a) => (a ? 1 : 0)).join(''));
    printf("layer on %d\n", layerIndex);
    uint8_t modifiers = getLayerAttachedModifiers(layerIndex);
    if (modifiers) {
      OutputKeyStrokeAction action = createLayerModifierOutputAction(modifiers, true);
      keyStrokeActionQueue_enqueueAction(action);
    }
  }
}

static void layerMutations_deactivate(uint8_t layerIndex) {
  if (layerMutations_isActive(layerIndex)) {
    layerState.layerActiveFlags &= ~(1 << layerIndex);
    // console.log(state.layerHoldFlags.map((a) => (a ? 1 : 0)).join(''));
    printf("layer off %d\n", layerIndex);
    uint8_t modifiers = getLayerAttachedModifiers(layerIndex);
    if (modifiers) {
      OutputKeyStrokeAction action = createLayerModifierOutputAction(modifiers, false);
      keyStrokeActionQueue_enqueueAction(action);
    }
  }
}

static void layerMutations_toggle(uint8_t layerIndex) {
  !layerMutations_isActive(layerIndex)
      ? layerMutations_activate(layerIndex)
      : layerMutations_deactivate(layerIndex);
}

static void layerMutations_oneshot(uint8_t layerIndex) {
  LayerState *ls = &layerState;
  layerMutations_activate(layerIndex);
  ls->oneshotLayerIndex = layerIndex;
  ls->oneshotCancelTick = -1;
  printf("oneshot\n");
}

static void layerMutations_clearOneshot() {
  LayerState *ls = &layerState;
  if (ls->oneshotLayerIndex != -1 && ls->oneshotCancelTick == -1) {
    ls->oneshotCancelTick = 0;
  }
}

static void layerMutations_oneshotCancellerTicker(uint16_t ms) {
  LayerState *ls = &layerState;
  if (ls->oneshotLayerIndex != -1 && ls->oneshotCancelTick >= 0) {
    ls->oneshotCancelTick += ms;
    if (ls->oneshotCancelTick > 50) {
      printf("cancel oneshot\n");
      layerMutations_deactivate(ls->oneshotLayerIndex);
      ls->oneshotLayerIndex = -1;
      ls->oneshotCancelTick = -1;
    }
  }
}

static void layerMutations_clearExclusive(uint8_t targetExclusiveGroup, int8_t skipLayerIndex) {
  uint8_t numLayers = getNumLayers();
  for (uint8_t i = 0; i < numLayers; i++) {
    if (i == skipLayerIndex) {
      continue;
    }
    uint8_t groupIndex = getLayerExclusionGroup(i);
    bool inGroup = groupIndex == targetExclusiveGroup;
    if (inGroup) {
      layerMutations_deactivate(i);
    }
  }
}

static void layerMutations_recoverMainLayerIfAllLayeresDisabled() {
  bool isAllOff = layerState.layerActiveFlags == 0;
  if (isAllOff) {
    layerMutations_activate(0);
  }
}

enum {
  OpType_KeyInput = 1,
  OpType__Reserved = 2,
  OpType_ExtendedOperation = 3,
};

enum {
  ExOpType_LayerCall = 1,
  ExOpType_LayerClearExclusive = 2,
  ExOpType_SystemAction = 3,
  ExOpType_MovePointerMovement = 4,
};

enum {
  InvocationMode_Hold = 1,
  InvocationMode_TurnOn = 2,
  InvocationMode_TurnOff = 3,
  InvocationMode_Toggle = 4,
  InvocationMode_Oneshot = 5,
};

enum {
  ShiftCancelMode_None = 0,
  ShiftCancelMode_ApplyToShiftLayer = 1,
  ShiftCancelMode_ApplyToAll = 2,
};

static uint16_t convertSingleModifierToFlags(uint16_t opWord) {
  uint16_t wordBase = opWord & 0xf000;
  uint8_t modifiers = (opWord >> 8) & 0x0f;
  uint8_t logicalKey = opWord & 0xff;
  if (LK_Ctrl <= logicalKey && logicalKey <= LK_Gui) {
    modifiers |= 1 << (logicalKey - LK_Ctrl);
    logicalKey = 0;
  }
  return wordBase | (modifiers << 8) | logicalKey;
}

static OutputKeyStrokeAction convertKeyInputOperationWordToOutputKeyStrokeAction(
    uint32_t opWord,
    bool isDown) {
  OutputKeyStrokeAction action = {
    isDown : 0,
    shiftCancel : 0,
    reserved : 0,
    modFlags : 0,
    hidKeyCode : 0,
  };
  action.isDown = isDown;
  opWord >>= 16;
  opWord = keyActionRemapper_translateKeyOperation(opWord, logicOptions.wiringMode);
  opWord = convertSingleModifierToFlags(opWord);
  uint8_t logicalKey = opWord & 0xff;
  action.modFlags = (opWord >> 8) & 0b1111;
  if (logicalKey) {
    bool isSecondaryLayout = logicOptions.systemLayout == 1;
    uint16_t hidKey = keyCodeTranslator_mapLogicalKeyToHidKeyCode(
        logicalKey, isSecondaryLayout);
    if ((hidKey & 0x200) > 0) {
      uint8_t shiftCancelMode = logicConfig.shiftCancelMode;
      if (shiftCancelMode == ShiftCancelMode_ApplyToShiftLayer) {
        bool isBelongToShiftLayer = ((opWord >> 12) & 1) > 0;
        if (isBelongToShiftLayer) {
          action.shiftCancel = 1;
        }
      } else if (shiftCancelMode == ShiftCancelMode_ApplyToAll) {
        action.shiftCancel = 1;
      }
    }
    bool shiftOn = (hidKey & 0x100) > 0;
    if (shiftOn) {
      action.modFlags |= ModFlag_Shift;
    }
    uint8_t keyCode = hidKey & 0xff;
    if (keyCode) {
      action.hidKeyCode = keyCode;
    }
  }
  return action;
}

static void handleOperationOn(uint32_t opWord) {
  uint8_t opType = (opWord >> 30) & 0b11;
  if (opType == OpType_KeyInput) {
    OutputKeyStrokeAction strokeAction = convertKeyInputOperationWordToOutputKeyStrokeAction(
        opWord,
        true);
    keyStrokeActionQueue_enqueueAction(strokeAction);
  }

  bool isLayerCall = false;

  if (opType == OpType_ExtendedOperation) {
    uint8_t exOpType = (opWord >> 24) & 0b111;
    if (exOpType == ExOpType_LayerCall) {
      isLayerCall = true;
      opWord >>= 16;
      uint8_t fInvocationMode = (opWord >> 4) & 0b1111;
      uint8_t layerIndex = opWord & 0b1111;

      if (fInvocationMode == InvocationMode_Hold) {
        layerMutations_activate(layerIndex);
      } else if (fInvocationMode == InvocationMode_TurnOn) {
        layerMutations_activate(layerIndex);
      } else if (fInvocationMode == InvocationMode_TurnOff) {
        layerMutations_deactivate(layerIndex);
      } else if (fInvocationMode == InvocationMode_Toggle) {
        layerMutations_toggle(layerIndex);
      } else if (fInvocationMode == InvocationMode_Oneshot) {
        layerMutations_oneshot(layerIndex);
      }
    }

    if (exOpType == ExOpType_LayerClearExclusive) {
      opWord >>= 16;
      uint8_t targetGroup = opWord & 0b111;
      layerMutations_clearExclusive(targetGroup, -1);
    }
    if (exOpType == ExOpType_SystemAction) {
      uint8_t actionCode = (opWord >> 16) & 0xff;
      uint8_t payloadValue = (opWord >> 8) & 0xff;
      configManager_handleSystemAction(actionCode, payloadValue);
    }
  }

  if (!isLayerCall) {
    layerMutations_clearOneshot();
  }
  layerMutations_recoverMainLayerIfAllLayeresDisabled();
}

static void handleOperationOff(uint32_t opWord) {
  uint8_t opType = (opWord >> 30) & 0b11;
  if (opType == OpType_KeyInput) {
    OutputKeyStrokeAction strokeAction = convertKeyInputOperationWordToOutputKeyStrokeAction(
        opWord,
        false);
    keyStrokeActionQueue_enqueueAction(strokeAction);
  }
  if (opType == OpType_ExtendedOperation) {
    uint8_t exOpType = (opWord >> 24) & 0b111;
    if (exOpType == ExOpType_LayerCall) {
      opWord >>= 16;
      uint8_t fInvocationMode = (opWord >> 4) & 0b1111;
      uint8_t layerIndex = opWord & 0b1111;
      if (fInvocationMode == InvocationMode_Hold) {
        layerMutations_deactivate(layerIndex);
      }
    }
  }
  layerMutations_recoverMainLayerIfAllLayeresDisabled();
}

//--------------------------------------------------------------------------------
//assign binder

#define KEY_INDEX_NONE 255

#ifndef KM0_KEYBOARD_CORELOGIC__NUM_INPUT_KEY_SLOTS
#define KM0_KEYBOARD_CORELOGIC__NUM_INPUT_KEY_SLOTS 10
#endif

#define NumKeySlots KM0_KEYBOARD_CORELOGIC__NUM_INPUT_KEY_SLOTS

// 15bytes/key
typedef struct _KeySlot {
  bool isActive : 1;
  bool hold : 1;
  bool nextHold : 1;
  bool interrupted : 1;
  bool resolving : 1;
  uint8_t inputEdge : 2;
  uint8_t keyIndex;
  uint8_t steps;
  uint16_t tick;
  int8_t liveLayerIndex;
  uint16_t liveLayerStateFlags;
  bool (*resolverProc)(struct _KeySlot *slot); //2bytes for AVR
  uint32_t opWord;
} KeySlot;

static void assignBinder_handleKeyOn(KeySlot *slot, uint32_t opWord) {
  //printf("handleKeyOn %d %d\n", keyIndex, opWord);
  handleOperationOn(opWord);
  slot->opWord = opWord;
}

static void assignBinder_handleKeyOff(KeySlot *slot) {
  if (slot->opWord) {
    //printf("handleKeyOff %d\n", keyIndex);
    handleOperationOff(slot->opWord);
    slot->opWord = 0;
  }
}

//--------------------------------------------------------------------------------
//resolver common

static const bool DebugShowTrigger = false;
// static const bool DebugShowTrigger = true;

enum {
  InputEdge_None = 0,
  InputEdge_Down = 1,
  InputEdge_Up = 2
};

enum {
  AssignOrder_Pri = 1,
  AssignOrder_Sec = 2,
  AssignOrder_Ter = 3
};

enum {
  Step_D = 0b01,
  Step_U = 0b10,
  Step_W = 0b11,

  Steps_D = 0b01,
  Steps_DU = 0b0110,
  Steps_D_ = 0b0111,
  Steps_DUD = 0b011001,
  Steps_U = 0b10,
  Steps_DU_ = 0b011011,
  Steps_DUD_ = 0b01100111,
  Steps_DUDU = 0b01100110,
};

typedef struct {
  uint8_t interruptKeyIndex;
  KeySlot keySlots[NumKeySlots];
} ResolverState;

static ResolverState resolverState;

static void initResolverState() {
  resolverState.interruptKeyIndex = KEY_INDEX_NONE;
  for (uint8_t i = 0; i < NumKeySlots; i++) {
    KeySlot *slot = &resolverState.keySlots[i];
    slot->isActive = false;
    slot->keyIndex = KEY_INDEX_NONE;
    slot->steps = 0;
    slot->hold = false;
    slot->nextHold = false;
    slot->tick = 0;
    slot->interrupted = false;
    slot->resolving = false;
    slot->liveLayerIndex = -1;
    slot->liveLayerStateFlags = 0;
    slot->resolverProc = NULL;
    slot->inputEdge = 0;
    slot->opWord = 0;
  }
}

static void keySlot_attachKey(KeySlot *slot, uint8_t keyIndex) {
  slot->isActive = true;
  slot->keyIndex = keyIndex;
  slot->steps = 0;
  slot->hold = false;
  slot->nextHold = false;
  slot->tick = 0;
  slot->interrupted = false;
  slot->resolving = false;
  slot->liveLayerIndex = -1;
  slot->liveLayerStateFlags = 0;
  slot->resolverProc = NULL;
  slot->inputEdge = 0;
  slot->opWord = 0;
}

static void keySlot_handleKeyOn(KeySlot *slot, uint8_t order) {
  AssignSet *pAssignSet = findAssignInLayerStack(slot->keyIndex, slot->liveLayerStateFlags);
  if (pAssignSet != NULL) {
    if (order == AssignOrder_Pri) {
      assignBinder_handleKeyOn(slot, pAssignSet->pri);
    } else if (order == AssignOrder_Sec) {
      assignBinder_handleKeyOn(slot, pAssignSet->sec);
    } else if (order == AssignOrder_Ter) {
      assignBinder_handleKeyOn(slot, pAssignSet->ter);
    }
  }
}

static void keySlot_handleKeyOff(KeySlot *slot) {
  assignBinder_handleKeyOff(slot);
}

static void keySlot_clearSteps(KeySlot *slot) {
  slot->steps = 0;
}

static void keySlot_addStep(KeySlot *slot, uint8_t step) {
  slot->steps = (slot->steps << 2) | step;
}

//--------------------------------------------------------------------------------
//resolver dummy

static bool keySlot_dummyResolver(KeySlot *slot) {
  if (slot->inputEdge == InputEdge_Up) {
    return true;
  }
  return false;
}

//--------------------------------------------------------------------------------
//resolver single

enum {
  TriggerA_Down = Steps_D,
  TriggerA_Up = Steps_U
};

static void keySlot_pushStepA(KeySlot *slot, uint8_t step) {
  keySlot_addStep(slot, step);

  uint8_t steps = slot->steps;

  if (steps == TriggerA_Down) {
    keySlot_handleKeyOn(slot, AssignOrder_Pri);
  }

  if (steps == TriggerA_Up) {
    keySlot_handleKeyOff(slot);
  }
}

static bool keySlot_singleResolverA(KeySlot *slot) {
  uint8_t inputEdge = slot->inputEdge;

  if (inputEdge == InputEdge_Down) {
    keySlot_clearSteps(slot);
    keySlot_pushStepA(slot, Step_D);
  }
  if (inputEdge == InputEdge_Up) {
    keySlot_clearSteps(slot);
    keySlot_pushStepA(slot, Step_U);
    return true;
  }
  return false;
}

//--------------------------------------------------------------------------------
//resolver dual

enum {
  TriggerB_Down = Steps_D,
  TriggerB_Tap = Steps_DU,
  TriggerB_Hold = Steps_D_,
  TriggerB_Rehold = Steps_DUD,
  TriggerB_Up = Steps_U
};

static void keySlot_pushStepB(KeySlot *slot, uint8_t step) {
  keySlot_addStep(slot, step);
  slot->tick = 0;

  uint8_t steps = slot->steps;

  if (steps == TriggerB_Down) {
  }

  if (steps == TriggerB_Tap) {
    keySlot_handleKeyOn(slot, AssignOrder_Pri);
    keySlot_handleKeyOff(slot);
  }

  if (steps == TriggerB_Hold) {
    keySlot_handleKeyOn(slot, AssignOrder_Sec);
  }

  if (steps == TriggerB_Rehold) {
    keySlot_handleKeyOn(slot, AssignOrder_Pri);
  }

  if (steps == TriggerB_Up) {
    keySlot_handleKeyOff(slot);
  }
}

static bool keySlot_dualResolverB(KeySlot *slot) {
  uint8_t inputEdge = slot->inputEdge;
  uint8_t steps = slot->steps;
  uint16_t tick = slot->tick;
  bool hold = slot->hold;
  bool interrupted = slot->interrupted;
  uint16_t tapHoldThresholdMs = logicConfig.tapHoldThresholdMs;

  if (inputEdge == InputEdge_Down) {
    if (steps == Steps_DU && tick < tapHoldThresholdMs) {
      //tap-rehold
      keySlot_pushStepB(slot, Step_D);
    } else {
      //down
      keySlot_clearSteps(slot);
      keySlot_pushStepB(slot, Step_D);
    }
  }

  if (steps == Steps_D && hold && tick >= tapHoldThresholdMs) {
    //hold
    keySlot_pushStepB(slot, Step_W);
  }

  if (steps == Steps_D && hold && tick < tapHoldThresholdMs && interrupted) {
    //interrupt hold
    keySlot_pushStepB(slot, Step_W);
  }

  if (steps == Steps_DU && !hold && tick >= tapHoldThresholdMs) {
    //silent after tap
    keySlot_pushStepB(slot, Step_W);
    return true;
  }

  if (inputEdge == InputEdge_Up) {
    if (steps == Steps_D && tick < tapHoldThresholdMs) {
      //tap
      keySlot_pushStepB(slot, Step_U);
    }
    if (steps == Steps_D_ || steps == Steps_DUD) {
      //hold up, rehold up
      keySlot_clearSteps(slot);
      keySlot_pushStepB(slot, Step_U);
      return true;
    }
  }
  return false;
}

//--------------------------------------------------------------------------------
//resolver triple

enum {
  TriggerC_Down = Steps_D,
  TriggerC_Hold = Steps_D_,
  TriggerC_Tap = Steps_DU_,
  TriggerC_Hold2 = Steps_DUD_,
  TriggerC_Tap2 = Steps_DUDU,
  TriggerC_Up = Steps_U
};

static void keySlot_pushStepC(KeySlot *slot, uint8_t step) {
  keySlot_addStep(slot, step);
  slot->tick = 0;

  uint8_t steps = slot->steps;

  if (steps == TriggerC_Down) {
  }

  if (steps == TriggerC_Tap) {
    keySlot_handleKeyOn(slot, AssignOrder_Pri);
    keySlot_handleKeyOff(slot);
  }

  if (steps == TriggerC_Hold) {
    keySlot_handleKeyOn(slot, AssignOrder_Sec);
  }

  if (steps == TriggerC_Hold2) {
    keySlot_handleKeyOn(slot, AssignOrder_Pri);
  }

  if (steps == TriggerC_Tap2) {
    keySlot_handleKeyOn(slot, AssignOrder_Ter);
    keySlot_handleKeyOff(slot);
  }

  if (steps == TriggerC_Up) {
    keySlot_handleKeyOff(slot);
  }
}

static bool keySlot_tripleResolverC(KeySlot *slot) {
  uint8_t inputEdge = slot->inputEdge;
  uint8_t steps = slot->steps;
  uint16_t tick = slot->tick;
  bool hold = slot->hold;
  bool interrupted = slot->interrupted;
  uint16_t tapHoldThresholdMs = logicConfig.tapHoldThresholdMs;

  if (inputEdge == InputEdge_Down) {
    if (steps == Steps_DU && tick < tapHoldThresholdMs) {
      //down2
      keySlot_pushStepC(slot, Step_D);
    } else {
      //down
      keySlot_clearSteps(slot);
      keySlot_pushStepC(slot, Step_D);
    }
  }

  if (steps == Steps_D && hold && tick >= tapHoldThresholdMs) {
    //hold
    keySlot_pushStepC(slot, Step_W);
  }

  if (steps == Steps_D && hold && tick < tapHoldThresholdMs && interrupted) {
    //interrupt hold
    keySlot_pushStepC(slot, Step_W);
  }

  if (steps == Steps_DUD && hold && tick >= tapHoldThresholdMs) {
    //hold2
    keySlot_pushStepC(slot, Step_W);
  }

  if (steps == Steps_DU && !hold && tick >= tapHoldThresholdMs) {
    //silent after single tap
    keySlot_pushStepC(slot, Step_W);
    return true;
  }

  if (inputEdge == InputEdge_Up) {
    if (steps == Steps_DUD && tick < tapHoldThresholdMs) {
      //double tap
      keySlot_pushStepC(slot, Step_U);
      return true;
    } else if (steps == Steps_D && tick < tapHoldThresholdMs) {
      //single tap
      keySlot_pushStepC(slot, Step_U);
    } else {
      //up
      keySlot_clearSteps(slot);
      keySlot_pushStepC(slot, Step_U);
      return true;
    }
  }
  return false;
}

//--------------------------------------------------------------------------------
//resolver root

static bool (*keySlotResolverFuncs[4])(KeySlot *slot) = {
  keySlot_dummyResolver,
  keySlot_singleResolverA,
  keySlot_dualResolverB,
  keySlot_tripleResolverC
};

static void keySlot_tick(KeySlot *slot, uint8_t ms) {
  slot->tick += ms;

  slot->inputEdge = InputEdge_None;
  if (!slot->hold && slot->nextHold) {
    slot->hold = true;
    slot->inputEdge = InputEdge_Down;
  }
  if (slot->hold && !slot->nextHold) {
    slot->hold = false;
    slot->inputEdge = InputEdge_Up;
  }

  ResolverState *rs = &resolverState;
  if (logicConfig.useInterruptHold) {
    slot->interrupted = rs->interruptKeyIndex != KEY_INDEX_NONE && rs->interruptKeyIndex != slot->keyIndex;
  }

  if (!slot->resolverProc && slot->inputEdge == InputEdge_Down) {
    uint16_t layerActiveFlags = getLayerActiveFlags();
    AssignSet *pAssignSet = findAssignInLayerStack(slot->keyIndex, layerActiveFlags);
    if (pAssignSet != NULL) {
      slot->liveLayerIndex = pAssignSet->layerIndex;
      slot->liveLayerStateFlags = layerActiveFlags;
      slot->resolverProc = keySlotResolverFuncs[pAssignSet->assignType];
      if (DebugShowTrigger) {
        printf("resolver attached %d %d\n", slot->keyIndex, pAssignSet->assignType);
      }
    }
  }

  if (slot->resolverProc) {
    bool done = slot->resolverProc(slot);
    if (done) {
      slot->liveLayerStateFlags = -1;
      slot->liveLayerStateFlags = 0;
      slot->resolverProc = NULL;
      if (DebugShowTrigger) {
        printf("resolver detached %d\n", slot->keyIndex);
      }
    }
  }
}

static void triggerResolver_tick(uint8_t ms) {
  ResolverState *rs = &resolverState;
  for (uint8_t i = 0; i < NumKeySlots; i++) {
    KeySlot *slot = &rs->keySlots[i];
    if (slot->isActive && slot->keyIndex != rs->interruptKeyIndex) {
      keySlot_tick(slot, ms);
    }
  }
  for (uint8_t i = 0; i < NumKeySlots; i++) {
    KeySlot *slot = &rs->keySlots[i];
    if (slot->isActive && slot->keyIndex == rs->interruptKeyIndex) {
      keySlot_tick(slot, ms);
    }
  }
  rs->interruptKeyIndex = KEY_INDEX_NONE;

  for (uint8_t i = 0; i < NumKeySlots; i++) {
    KeySlot *slot = &rs->keySlots[i];
    if (slot->isActive &&
        !slot->hold &&
        slot->resolverProc == NULL) {
      // printf("key %d detached from slot\n", slot->keyIndex);
      slot->isActive = false;
    }
  }
}

static KeySlot *triggerResolver_attachKeyToFreeSlot(uint8_t keyIndex) {
  for (uint8_t i = 0; i < NumKeySlots; i++) {
    KeySlot *slot = &resolverState.keySlots[i];
    if (!slot->isActive) {
      keySlot_attachKey(slot, keyIndex);
      // printf("key %d attached to slot\n", keyIndex);
      return slot;
    }
  }
  return NULL;
}

static KeySlot *triggerResolver_getActiveKeySlotByKeyIndex(uint8_t keyIndex) {
  for (uint8_t i = 0; i < NumKeySlots; i++) {
    KeySlot *slot = &resolverState.keySlots[i];
    if (slot->isActive && slot->keyIndex == keyIndex) {
      return slot;
    }
  }
  return NULL;
}

static void triggerResolver_handleKeyInput(uint8_t keyIndex, bool isDown) {
  if (isDown) {
    //printf("corelogic, keydown %d\n", keyIndex);
    KeySlot *slot = triggerResolver_getActiveKeySlotByKeyIndex(keyIndex);
    if (!slot) {
      slot = triggerResolver_attachKeyToFreeSlot(keyIndex);
    }
    if (slot) {
      resolverState.interruptKeyIndex = keyIndex;
      slot->nextHold = true;
    } else {
      printf("cannot attach key %d to slot\n", keyIndex);
    }
  } else {
    //printf("corelogic, keyup %d\n", keyIndex);
    KeySlot *slot = triggerResolver_getActiveKeySlotByKeyIndex(keyIndex);
    if (slot) {
      slot->nextHold = false;
    }
  }
}

//--------------------------------------------------------------------------------
//exports

static bool logicActive = false;

void keyboardCoreLogic_initialize() {
  initAssignMemoryReader();
  resetHidReportState();
  resetLayerState();
  initResolverState();
  logicActive = true;
}

void keyboardCoreLogic_setSystemLayout(uint8_t layout) {
  setSystemLayout(layout);
}

void keyboardCoreLogic_setWiringMode(uint8_t mode) {
  setWiringMode(mode);
}

uint8_t *keyboardCoreLogic_getOutputHidReportBytes() {
  if (logicActive) {
    return getOutputHidReport();
  } else {
    return getOutputHidReportZeros();
  }
}

uint16_t keyboardCoreLogic_getLayerActiveFlags() {
  if (logicActive) {
    keyStrokeActionQueue_shiftQueuedActionOne();
    return getLayerActiveFlags();
  } else {
    return 0;
  }
}

void keyboardCoreLogic_issuePhysicalKeyStateChanged(uint8_t keyIndex, bool isDown) {
  if (logicActive) {
    triggerResolver_handleKeyInput(keyIndex, isDown);
  }
}

void keyboardCoreLogic_processTicker(uint8_t ms) {
  if (logicActive) {
    triggerResolver_tick(ms);
    layerMutations_oneshotCancellerTicker(ms);
  }
}

void keyboardCoreLogic_halt() {
  logicActive = false;
}
