#include "bit_operations.h"
#include "keyboardCoreLogic.h"
#include "xf_eeprom.h"
#include <stdio.h>

//--------------------------------------------------------------------------------
//hid report

static uint8_t hidReportBuf[8] = { 0 };

enum {
  ModFlag_Ctrl = 1,
  ModFlag_Shift = 2,
  ModFlag_Alt = 4,
  ModFlag_OS = 8
};

static void setModifiers(uint8_t modFlags) {
  hidReportBuf[0] |= modFlags;
}

static void clearModifiers(uint8_t modFlags) {
  hidReportBuf[0] &= ~modFlags;
}

static void setOutputKeyCode(uint8_t hidKeyCode) {
  hidReportBuf[2] = hidKeyCode;
}

//--------------------------------------------------------------------------------
//assing memory reader

static uint8_t readEepRomByte(uint16_t addr) {
  return xf_eeprom_read_byte(addr);
}

static uint16_t readEepRomWordBigEndian(uint16_t addr) {
  uint8_t a = xf_eeprom_read_byte(addr);
  uint8_t b = xf_eeprom_read_byte(addr + 1);
  return a << 8 | b;
}

static uint16_t getAssignsBlockAddressForKey(uint8_t targetKeyIndex) {
  uint16_t addr = 24;
  while (addr < 1024) {
    uint8_t data = readEepRomByte(addr);
    if (data == 0) {
      break;
    }
    if ((data & 0x80) > 0) {
      uint8_t keyIndex = data & 0x7f;
      if (keyIndex == targetKeyIndex) {
        return addr;
      }
    }
    addr++;
    uint8_t bodyLength = readEepRomByte(addr++);
    addr += bodyLength;
  }
  return 0;
}

static uint16_t getAssignBlockAddressForLayer(uint16_t baseAddr, uint8_t targetLayerIndex) {
  uint8_t len = readEepRomByte(baseAddr + 1);
  uint16_t addr = baseAddr + 2;
  uint16_t endAddr = baseAddr + len;
  while (addr < endAddr) {
    uint8_t data = readEepRomByte(addr);
    uint8_t layerIndex = data & 0b1111;
    if (layerIndex == targetLayerIndex) {
      return addr;
    }
    addr++;
    uint8_t tt = data >> 4 & 0b11;
    uint8_t isDual = tt == 0b10;
    uint8_t numBlockBytes = isDual ? 4 : 2;
    addr += numBlockBytes;
  }
  return 0;
}

typedef struct {
  uint8_t assignType;
  uint16_t pri;
  uint16_t sec;
  uint16_t ter;
} AssignSet;

static AssignSet assignSetRes;

static AssignSet *getAssignSet(uint8_t layerIndex, uint8_t keyIndex) {
  uint16_t addr0 = getAssignsBlockAddressForKey(keyIndex);
  if (addr0 > 0) {
    uint16_t addr1 = getAssignBlockAddressForLayer(addr0, layerIndex);
    if (addr1 > 0) {
      uint8_t entryHeaderByte = readEepRomByte(addr1);
      uint8_t tt = entryHeaderByte >> 4 & 0b11;
      bool isDual = tt == 0b10;
      bool isTriple = tt == 0b11;
      assignSetRes.assignType = tt;
      assignSetRes.pri = readEepRomWordBigEndian(addr1 + 1);
      assignSetRes.sec = (isDual || isTriple) ? readEepRomWordBigEndian(addr1 + 3) : 0;
      assignSetRes.ter = isTriple ? readEepRomWordBigEndian(addr1 + 5) : 0;
      return &assignSetRes;
    }
  }
  return NULL;
}

//--------------------------------------------------------------------------------
//operation handlers

static uint8_t currentLayerIndex = 0;
static uint16_t layerHoldFlags = 0;
static uint16_t layerDefaultSchemeBlockFlags = 0;

static AssignSet *getAssignSetL(uint8_t keyIndex) {
  for (int8_t i = 15; i >= 0; i--) {
    if (bit_is_on(layerHoldFlags, i) || i == 0) {
      AssignSet *res = getAssignSet(i, keyIndex);
      bool isDefaultSchemeBlock = bit_is_on(layerDefaultSchemeBlockFlags, i);
      if (!res && isDefaultSchemeBlock) {
        return NULL;
      }
      if (res) {
        return res;
      }
    }
  }
  return NULL;
}

static const uint8_t OpType_keyInput = 0b01;
static const uint8_t OpType_layerCall = 0b10;

static void handleOperationOn(uint16_t opWord) {
  uint8_t opType = (opWord >> 14) & 0b11;
  if (opType == OpType_keyInput) {
    uint16_t hidKey = opWord & 0x3ff;
    uint8_t modFlags = (opWord >> 10) & 0b1111;
    if (modFlags) {
      setModifiers(modFlags);
    }
    if (hidKey) {
      uint8_t keyCode = hidKey & 0xff;
      bool shiftOn = hidKey & 0x100;
      bool shiftOff = hidKey & 0x200;
      bool isOtherModifiersClean = (hidReportBuf[0] & 0b1101) == 0;
      if (shiftOn) {
        hidReportBuf[0] = 2;
        setModifiers(ModFlag_Shift);
      }
      if (shiftOff && isOtherModifiersClean) {
        hidReportBuf[0] = 0;
        clearModifiers(ModFlag_Shift);
      }
      if (keyCode) {
        setOutputKeyCode(keyCode);
      }
    }
  }
  if (opType == OpType_layerCall) {
    uint8_t layerIndex = (opWord >> 8) & 0b1111;
    bool withShift = (opWord >> 13) & 0b1;
    bool isDefaultSchemeBlock = (opWord >> 12) & 0b1;
    currentLayerIndex = layerIndex;
    bit_on(layerHoldFlags, layerIndex);
    bit_spec(layerDefaultSchemeBlockFlags, layerIndex, isDefaultSchemeBlock);
    if (withShift) {
      setModifiers(ModFlag_Shift);
    }
  }
}

static void handleOperationOff(uint16_t opWord) {
  uint8_t opType = (opWord >> 14) & 0b11;
  if (opType == OpType_keyInput) {
    uint16_t hidKey = opWord & 0x3ff;
    uint8_t modFlags = (opWord >> 10) & 0b1111;
    if (modFlags) {
      clearModifiers(modFlags);
    }
    if (hidKey) {
      uint8_t keyCode = hidKey & 0xff;
      bool shiftOn = hidKey & 0x100;
      bool shiftOff = hidKey & 0x200;
      if (shiftOn) {
        clearModifiers(ModFlag_Shift);
      }
      if (shiftOff) {
      }
      if (keyCode) {
        setOutputKeyCode(0);
      }
    }
  }
  if (opType == OpType_layerCall) {
    currentLayerIndex = 0;
    uint8_t layerIndex = (opWord >> 8) & 0b1111;
    bit_off(layerHoldFlags, layerIndex);
    bool withShift = (opWord >> 13) & 0b1;
    if (withShift) {
      clearModifiers(ModFlag_Shift);
    }
  }
}

//--------------------------------------------------------------------------------
//assign binder

#define CORELOGIC_NUMKEYSLOTS 64

#define NumRecallKeyEntries 4

static const uint8_t ImmediateReleaseStrokeDuration = 50;

typedef struct {
  int8_t keyIndex;
  uint8_t tick;
} RecallKeyEntry;

static uint16_t keyAttachedOperationWords[CORELOGIC_NUMKEYSLOTS] = { 0 };
static RecallKeyEntry recallKeyEntries[NumRecallKeyEntries] = { 0 };

static void initRecallKeyEntries() {
  for (uint8_t i = 0; i < NumRecallKeyEntries; i++) {
    RecallKeyEntry *ke = &recallKeyEntries[i];
    ke->keyIndex = -1;
    ke->tick = 0;
  }
}

static void handleKeyOn(uint8_t keyIndex, uint16_t opWord) {
  //printf("handleKeyOn %d %d\n", keyIndex, opWord);
  handleOperationOn(opWord);
  keyAttachedOperationWords[keyIndex] = opWord;
}

static void handleKeyOff(uint8_t keyIndex) {
  uint16_t opWord = keyAttachedOperationWords[keyIndex];
  if (opWord) {
    //printf("handleKeyOff %d\n", keyIndex);
    handleOperationOff(opWord);
    keyAttachedOperationWords[keyIndex] = 0;
  }
}

static void recallKeyOff(uint8_t keyIndex) {
  for (uint8_t i = 0; i < NumRecallKeyEntries; i++) {
    RecallKeyEntry *ke = &recallKeyEntries[i];
    if (ke->keyIndex == -1) {
      //printf("reserve recall %d\n", keyIndex);
      ke->keyIndex = keyIndex;
      ke->tick = 0;
      break;
    }
  }
}

static void assignBinder_ticker(uint8_t ms) {
  for (uint8_t i = 0; i < NumRecallKeyEntries; i++) {
    RecallKeyEntry *ke = &recallKeyEntries[i];
    if (ke->keyIndex != -1) {
      ke->tick += ms;
      if (ke->tick > ImmediateReleaseStrokeDuration) {
        //printf("exec recall %d\n", ke->keyIndex);
        handleKeyOff(ke->keyIndex);
        ke->keyIndex = -1;
      }
    }
  }
}

//--------------------------------------------------------------------------------
//resolver common

enum {
  InputEdge_None = 0,
  InputEdge_Down = 1,
  InputEdge_Up = 2
};

static int8_t interruptKeyIndex = -1;

static const uint8_t TH = 200;

static AssignSet fallbackAssignSet = {
  assignType : 0,
  pri : 0,
  sec : 0,
  ter : 0,
};

// 18bytes/key
typedef struct _KeySlot {
  uint8_t keyIndex;
  uint8_t steps;
  bool hold;
  bool nextHold;
  uint16_t tick;
  bool interrupted;
  bool resolving;
  AssignSet assignSet;                         //7bytes
  bool (*resolverProc)(struct _KeySlot *slot); //2bytes
  uint8_t inputEdge;
} KeySlot;

static KeySlot keySlots[CORELOGIC_NUMKEYSLOTS] = { 0 };

static void initKeySlots() {
  for (uint8_t i = 0; i < CORELOGIC_NUMKEYSLOTS; i++) {
    KeySlot *slot = &keySlots[i];
    slot->keyIndex = i;
    slot->assignSet = fallbackAssignSet;
    slot->tick = 0;
  }
}

static void keySlot_clearSteps(KeySlot *slot) {
  slot->steps = 0;
}

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
  uint8_t keyIndex = slot->keyIndex;
  AssignSet *assignSet = &slot->assignSet;

  if (steps == TriggerA_Down) {
    handleKeyOn(keyIndex, assignSet->pri);
  }

  if (steps == TriggerA_Up) {
    handleKeyOff(keyIndex);
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
  uint8_t keyIndex = slot->keyIndex;
  AssignSet *assignSet = &slot->assignSet;

  if (steps == TriggerB_Down) {
  }

  if (steps == TriggerB_Tap) {
    handleKeyOn(keyIndex, assignSet->pri);
    recallKeyOff(keyIndex);
  }

  if (steps == TriggerB_Hold) {
    handleKeyOn(keyIndex, assignSet->sec);
  }

  if (steps == TriggerB_Rehold) {
    handleKeyOn(keyIndex, assignSet->pri);
  }

  if (steps == TriggerB_Up) {
    handleKeyOff(keyIndex);
  }
}

static bool keySlot_dualResolverB(KeySlot *slot) {
  uint8_t inputEdge = slot->inputEdge;
  uint8_t steps = slot->steps;
  uint16_t tick = slot->tick;
  bool hold = slot->hold;
  bool interrupted = slot->interrupted;

  if (inputEdge == InputEdge_Down) {
    if (steps == Steps_DU && tick < TH) {
      //tap-rehold
      keySlot_pushStepB(slot, Step_D);
    } else {
      //down
      keySlot_clearSteps(slot);
      keySlot_pushStepB(slot, Step_D);
    }
  }

  if (steps == Steps_D && hold && tick >= TH) {
    //hold
    keySlot_pushStepB(slot, Step_W);
  }

  if (steps == Steps_D && hold && tick < TH && interrupted) {
    //interrupt hold
    keySlot_pushStepB(slot, Step_W);
  }

  if (steps == Steps_DU && !hold && tick >= TH) {
    //silent after tap
    keySlot_pushStepB(slot, Step_W);
    return true;
  }

  if (inputEdge == InputEdge_Up) {
    if (steps == Steps_D && tick < TH) {
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
  uint8_t keyIndex = slot->keyIndex;
  AssignSet *assignSet = &slot->assignSet;

  if (steps == TriggerC_Down) {
  }

  if (steps == TriggerC_Tap) {
    handleKeyOn(keyIndex, assignSet->pri);
    recallKeyOff(keyIndex);
  }

  if (steps == TriggerC_Hold) {
    handleKeyOn(keyIndex, assignSet->sec);
  }

  if (steps == TriggerC_Hold2) {
    handleKeyOn(keyIndex, assignSet->pri);
  }

  if (steps == TriggerC_Tap2) {
    handleKeyOn(keyIndex, assignSet->ter);
    recallKeyOff(keyIndex);
  }

  if (steps == TriggerC_Up) {
    handleKeyOff(keyIndex);
  }
}

static bool keySlot_tripleResolverC(KeySlot *slot) {
  uint8_t inputEdge = slot->inputEdge;
  uint8_t steps = slot->steps;
  uint16_t tick = slot->tick;
  bool hold = slot->hold;
  bool interrupted = slot->interrupted;

  if (inputEdge == InputEdge_Down) {
    if (steps == Steps_DU && tick < TH) {
      //down2
      keySlot_pushStepC(slot, Step_D);
    } else {
      //down
      keySlot_clearSteps(slot);
      keySlot_pushStepC(slot, Step_D);
    }
  }

  if (steps == Steps_D && hold && tick >= TH) {
    //hold
    keySlot_pushStepC(slot, Step_W);
  }

  if (steps == Steps_D && hold && tick < TH && interrupted) {
    //interrupt hold
    keySlot_pushStepC(slot, Step_W);
  }

  if (steps == Steps_DUD && hold && tick >= TH) {
    //hold2
    keySlot_pushStepC(slot, Step_W);
  }

  if (steps == Steps_DU && !hold && tick >= TH) {
    //silent after single tap
    keySlot_pushStepC(slot, Step_W);
    return true;
  }

  if (inputEdge == InputEdge_Up) {
    if (steps == Steps_DUD && tick < TH) {
      //double tap
      keySlot_pushStepC(slot, Step_U);
      return true;
    } else if (steps == Steps_D && tick < TH) {
      //single stap
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

  slot->interrupted = interruptKeyIndex != -1 && interruptKeyIndex != slot->keyIndex;

  if (!slot->resolverProc && slot->inputEdge == InputEdge_Down) {
    AssignSet *pAssignSet = getAssignSetL(slot->keyIndex);
    slot->assignSet = (pAssignSet != NULL) ? *pAssignSet : fallbackAssignSet;

    //printf("check assignSet pri, %d, %d　%d\n", pAssignSet != NULL, slot->assignSet.pri, slot->assignSet.assignType);

    slot->resolverProc = keySlotResolverFuncs[slot->assignSet.assignType];
  }

  if (slot->resolverProc) {
    bool done = slot->resolverProc(slot);
    if (done) {
      slot->resolverProc = NULL;
      //printf("release\n");
    }
  }
}

static void triggerResolver_tick(uint8_t ms) {
  for (uint8_t i = 0; i < CORELOGIC_NUMKEYSLOTS; i++) {
    if (i != interruptKeyIndex) {
      KeySlot *slot = &keySlots[i];
      keySlot_tick(slot, ms);
    }
  }
  if (interruptKeyIndex != -1) {
    KeySlot *slot = &keySlots[interruptKeyIndex];
    keySlot_tick(slot, ms);
  }
  interruptKeyIndex = -1;
}

static void triggerResolver_handleKeyInput(uint8_t keyIndex, bool isDown) {
  if (keyIndex >= CORELOGIC_NUMKEYSLOTS) {
    return;
  }
  KeySlot *slot = &keySlots[keyIndex];
  if (isDown) {
    interruptKeyIndex = keyIndex;
    slot->nextHold = true;
    //printf("corelogic, down %d\n", keyIndex);
  } else {
    slot->nextHold = false;
    //printf("corelogic, up %d\n", keyIndex);
  }
}

//--------------------------------------------------------------------------------
//exports

void keyboardCoreLogic_initialize() {
  initRecallKeyEntries();
  initKeySlots();
}

uint8_t *keyboardCoreLogic_getOutputHidReportBytes() {
  return hidReportBuf;
}

uint8_t keyboardCoreLogic_getCurrentLayerIndex() {
  return currentLayerIndex;
}

void keyboardCoreLogic_issuePhysicalKeyStateChanged(uint8_t keyIndex, bool isDown) {
  triggerResolver_handleKeyInput(keyIndex, isDown);
}

void keyboardCoreLogic_processTicker(uint8_t ms) {
  triggerResolver_tick(ms);
  assignBinder_ticker(ms);
}
