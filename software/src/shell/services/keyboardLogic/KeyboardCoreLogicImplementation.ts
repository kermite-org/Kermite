/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */

import {
  LogicalKey,
  keyCodeTranslator_mapLogicalKeyToHidKeyCode,
} from '~/shared';
import { dataStorage } from '~/shell/services/keyboardLogic/DataStorage';
import {
  keyActionRemapper_setupDataReader,
  keyActionRemapper_translateKeyOperation,
} from '~/shell/services/keyboardLogic/KeyActionRemapper';
import { KeyboardCoreLogicInterface } from './KeyboardCoreLogicInterface';

// --------------------------------------------------------------------------------
// types

type u8 = number;
type s8 = number;
type u16 = number;
type u32 = number;
type size_t = number;

// --------------------------------------------------------------------------------
// helpers

function strU16Bin(val: u16) {
  return `0000000000000000${val.toString(2)}`.slice(-16);
}

function strU16Hex(val: u16) {
  return `0000${val.toString(16)}`.slice(-4);
}

function getFieldNameByValue(obj: any, value: string) {
  for (const key in obj) {
    if (obj[key] === value) {
      return key;
    }
  }
  return undefined;
}

// --------------------------------------------------------------------------------
// assign memory storage

function readStorageByte(addr: u16): u8 {
  return dataStorage.readByte(addr);
}

function readStorageWordBE(addr: u16): u16 {
  const a = dataStorage.readByte(addr);
  const b = dataStorage.readByte(addr + 1);
  return (a << 8) | b;
}

// --------------------------------------------------------------------------------
// execution options

const logicOptions = new (class {
  systemLayout: u8 = 0;
  wiringMode: u8 = 0;
})();

function setSystemLayout(layout: u8) {
  logicOptions.systemLayout = layout;
}

function setWiringMode(mode: u8) {
  logicOptions.wiringMode = mode;
}

// --------------------------------------------------------------------------------
// hid report

const ModFlag = {
  Ctrl: 1,
  Shift: 2,
  Alt: 4,
  OS: 8,
};

const NumHidReportBytes = 8;
const NumHidHoldKeySlots = 6;

const hidReportState = new (class {
  hidReportBuf: u8[] = Array(NumHidReportBytes).fill(0);
  modCounts: number[] = Array(4).fill(0);
  shiftCancelCount: u8 = 0;
  hidKeyCodes: u8[] = Array(NumHidHoldKeySlots).fill(0);
  nextKeyPos: u8 = 0;
})();

function getModFlagsFromModCounts(): u8 {
  const { modCounts } = hidReportState;
  let modFlags = 0;
  for (let i = 0; i < 4; i++) {
    if (modCounts[i] > 0) {
      modFlags |= 1 << i;
    }
  }
  return modFlags;
}

function resetHidReportState() {
  const rs = hidReportState;
  rs.hidReportBuf.fill(0);
  rs.modCounts.fill(0);
  rs.shiftCancelCount = 0;
  rs.hidKeyCodes.fill(0);
  rs.nextKeyPos = 0;
}

function getOutputHidReport(): u8[] {
  const rs = hidReportState;

  let modifiers = getModFlagsFromModCounts();
  if (modifiers === 0b0010 && rs.shiftCancelCount > 0) {
    modifiers = 0;
  }
  rs.hidReportBuf[0] = modifiers;
  for (let i = 0; i < NumHidHoldKeySlots; i++) {
    rs.hidReportBuf[i + 2] = rs.hidKeyCodes[i];
  }
  return rs.hidReportBuf;
}

function getOutputHidReportZeros(): u8[] {
  hidReportState.hidReportBuf.fill(0);
  return hidReportState.hidReportBuf;
}

function setModifiers(modFlags: u8) {
  const { modCounts } = hidReportState;
  for (let i = 0; i < 4; i++) {
    if (((modFlags >> i) & 1) > 0) {
      modCounts[i]++;
    }
  }
}

function clearModifiers(modFlags: u8) {
  const { modCounts } = hidReportState;
  for (let i = 0; i < 4; i++) {
    if (((modFlags >> i) & 1) > 0 && modCounts[i] > 0) {
      modCounts[i]--;
    }
  }
}

function rollNextKeyPos() {
  const rs = hidReportState;
  for (let i = 0; i < NumHidHoldKeySlots; i++) {
    rs.nextKeyPos = (rs.nextKeyPos + 1) % NumHidHoldKeySlots;
    if (rs.hidKeyCodes[rs.nextKeyPos] === 0) {
      break;
    }
  }
  return rs.nextKeyPos;
}

function pushOutputKeyCode(hidKeyCode: u8) {
  const pos = rollNextKeyPos();
  hidReportState.hidKeyCodes[pos] = hidKeyCode;
}

function removeOutputKeyCode(hidKeyCode: u8) {
  const rs = hidReportState;
  for (let i = 0; i < NumHidHoldKeySlots; i++) {
    if (rs.hidKeyCodes[i] === hidKeyCode) {
      rs.hidKeyCodes[i] = 0;
      break;
    }
  }
}

function startShiftCancel() {
  hidReportState.shiftCancelCount++;
}

function endShiftCancel() {
  if (hidReportState.shiftCancelCount > 0) {
    hidReportState.shiftCancelCount--;
  }
}

// --------------------------------------------------------------------------------
// key stroke action queue

type BitField<N> = number;
interface OutputKeyStrokeAction {
  isDown: BitField<1>;
  shiftCancel: BitField<1>;
  reserved: BitField<2>;
  modFlags: BitField<4>;
  hidKeyCode: BitField<8>;
}

const OutputActionQueueSize = 8;
const OutputActionQueueIndexMask = 7;
const keyStrokeActionQueueState = new (class {
  buffer: OutputKeyStrokeAction[] = Array(OutputActionQueueSize).fill(0);
  writePos: u8 = 0;
  readPos: u8 = 0;
})();

function keyStrokeActionQueue_enqueueActionRaw(action: OutputKeyStrokeAction) {
  const size = OutputActionQueueSize;
  const mask = OutputActionQueueIndexMask;
  const qs = keyStrokeActionQueueState;
  const count = (qs.writePos - qs.readPos + size) & mask;
  if (count < OutputActionQueueSize) {
    qs.buffer[qs.writePos] = action;
    qs.writePos = (qs.writePos + 1) & mask;
  }
}

function keyStrokeActionQueue_enqueueAction(action: OutputKeyStrokeAction) {
  // OSのHIDキーボードのドライバによってはモディファイヤとレポートが同時に変更される状況にうまく対応できない場合があるため、それを回避
  // キーとモディファイヤが同時に変更された場合に、モディファイヤを1フレーム先行してHIDレポートに反映し、
  // 次のフレームでキーをレポートに反映する。
  if (action.shiftCancel > 0 || action.modFlags > 0) {
    keyStrokeActionQueue_enqueueActionRaw({
      isDown: action.isDown,
      shiftCancel: action.shiftCancel,
      reserved: 0,
      modFlags: action.modFlags,
      hidKeyCode: 0,
    });
  }
  if (action.hidKeyCode > 0) {
    keyStrokeActionQueue_enqueueActionRaw({
      isDown: action.isDown,
      shiftCancel: 0,
      reserved: 0,
      modFlags: 0,
      hidKeyCode: action.hidKeyCode,
    });
  }
}

function keyStrokeActionQueue_executeAction(action: OutputKeyStrokeAction) {
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

function keyStrokeActionQueue_shiftQueuedActionOne() {
  const size = OutputActionQueueSize;
  const mask = OutputActionQueueIndexMask;
  const qs = keyStrokeActionQueueState;
  const count = (qs.writePos - qs.readPos + size) & mask;
  if (count > 0) {
    const action = qs.buffer[qs.readPos];
    qs.readPos = (qs.readPos + 1) & mask;
    keyStrokeActionQueue_executeAction(action);
  }
}

// --------------------------------------------------------------------------------
// assign memory reader

const NumLayersMax = 16;
const assignMemoryReaderState = new (class {
  numLayers: u8 = 0;
  assignsStartAddress: u16 = 0;
  assignsEndAddress: u16 = 0;
  layerAttributeWords: u16[] = Array(NumLayersMax).fill(0);
})();

function initAssignMemoryReader() {
  const profileHeaderLocation = dataStorage.getChunk_profileHeader().address;
  const layerListDataLocation = dataStorage.getChunk_layerList().address;
  const keyMappingDataLocation = dataStorage.getChunk_keyAssigns().address;
  const keyMappingDataSize = dataStorage.getChunk_keyAssigns().size;
  const rs = assignMemoryReaderState;
  const numLayers = readStorageByte(profileHeaderLocation + 4);
  rs.numLayers = numLayers;
  rs.assignsStartAddress = keyMappingDataLocation;
  rs.assignsEndAddress = keyMappingDataLocation + keyMappingDataSize;
  // console.log('nl:%d bl:%d\n', numLayers, keyMappingDataSize);
  for (let i = 0; i < 16; i++) {
    rs.layerAttributeWords[i] =
      i < numLayers ? readStorageWordBE(layerListDataLocation + i * 2) : 0;
  }
  keyActionRemapper_setupDataReader();
}

function getNumLayers() {
  return assignMemoryReaderState.numLayers;
}

function isLayerDefaultSchemeBlock(layerIndex: u8) {
  const attrWord = assignMemoryReaderState.layerAttributeWords[layerIndex];
  return ((attrWord >> 15) & 1) === 1;
}

function getLayerAttachedModifiers(layerIndex: u8) {
  const attrWord = assignMemoryReaderState.layerAttributeWords[layerIndex];
  return (attrWord >> 8) & 0b1111;
}

function getLayerInitialActive(layerIndex: u8) {
  const attrWord = assignMemoryReaderState.layerAttributeWords[layerIndex];
  return ((attrWord >> 13) & 1) === 1;
}

function getLayerExclusionGroup(layerIndex: u8) {
  const attrWord = assignMemoryReaderState.layerAttributeWords[layerIndex];
  return attrWord & 0b111;
}

function getAssignsBlockAddressForKey(targetKeyIndex: u8): u16 {
  let addr = assignMemoryReaderState.assignsStartAddress;
  while (addr < assignMemoryReaderState.assignsEndAddress) {
    const data = readStorageWordBE(addr);
    const fIsAssign = ((data >> 15) & 1) > 0;
    const fBodyLength = (data >> 8) & 0x7f;
    const fKeyIndex = data & 0xff;

    if (!fIsAssign) {
      break;
    }
    if (fKeyIndex === targetKeyIndex) {
      return addr;
    }

    addr += 2;
    addr += fBodyLength;
  }
  return 0;
}

const AssignType = {
  None: 0,
  Single: 1,
  Dual: 2,
  Tri: 3,
  Block: 4,
  Transparent: 5,
};

function decodeOperationWordsLength(code: u8): number {
  const szPri = ((code >> 6) & 0b11) + 1;
  const szSec = (code >> 3) & 0b111;
  const szTer = code & 0b111;
  return szPri + szSec + szTer;
}

function decodeOperationWordLengths(code: u8): number[] {
  const szPri = ((code >> 6) & 0b11) + 1;
  const szSec = (code >> 3) & 0b111;
  const szTer = code & 0b111;
  return [szPri, szSec, szTer];
}

function getAssignBlockAddressForLayer(
  baseAddr: u8,
  targetLayerIndex: u8,
): u16 {
  const len = readStorageByte(baseAddr) & 0x7f;
  let addr = baseAddr + 2;
  const endPos = addr + len;
  while (addr < endPos) {
    const data = readStorageByte(addr);
    const layerIndex = data & 0b1111;
    if (layerIndex === targetLayerIndex) {
      return addr;
    }
    addr++;
    const assignType = (data >> 4) & 0b111;
    let numBlockBytes = 0;
    if (
      assignType === AssignType.Single ||
      assignType === AssignType.Dual ||
      assignType === AssignType.Tri
    ) {
      const secondByte = readStorageByte(addr);
      numBlockBytes = decodeOperationWordsLength(secondByte);
      addr++;
    }
    addr += numBlockBytes;
  }
  return 0;
}

interface IAssignSet {
  assignType: u8;
  pri: u32;
  sec: u32;
  ter: u32;
  layerIndex: s8;
}

function readOperationWordVL4(addr: u16, sz: u8): u32 {
  let word = 0;
  for (let i = 0; i < sz; i++) {
    word = (word << 8) | readStorageByte(addr++);
  }
  for (let i = 0; i < 4 - sz; i++) {
    word <<= 8;
  }
  return word;
}

function getAssignSetInLayer(
  keyIndex: u8,
  layerIndex: u8,
): IAssignSet | undefined {
  const addr0 = getAssignsBlockAddressForKey(keyIndex);
  if (addr0 > 0) {
    const addr1 = getAssignBlockAddressForLayer(addr0, layerIndex);
    // console.log({ keyIndex, layerIndex, pos0: pos0 + 24, pos1: pos1 + 24 });
    if (addr1 > 0) {
      const entryHeaderByte = readStorageByte(addr1);
      const assignType = (entryHeaderByte >> 4) & 0b111;
      const isBlock = assignType === 4;
      const isTrans = assignType === 5;
      if (isBlock || isTrans) {
        return { assignType, pri: 0, sec: 0, ter: 0, layerIndex: -1 };
      }
      const isDual = assignType === 2;
      const isTriple = assignType === 3;

      const secondByte = readStorageByte(addr1 + 1);
      const [sz0, sz1, sz2] = decodeOperationWordLengths(secondByte);
      const pos = addr1 + 2;

      const pri = readOperationWordVL4(pos, sz0);
      const sec = isDual || isTriple ? readOperationWordVL4(pos + sz0, sz1) : 0;
      const ter = isTriple ? readOperationWordVL4(pos + sz0 + sz1, sz2) : 0;
      return {
        assignType,
        pri,
        sec,
        ter,
        layerIndex,
      };
    }
  }
  return undefined;
}

function findAssignInLayerStack(
  keyIndex: u8,
  layerActiveFlags: u16,
): IAssignSet | undefined {
  for (let i = 15; i >= 0; i--) {
    if ((layerActiveFlags >> i) & 1) {
      const res = getAssignSetInLayer(keyIndex, i);
      const isDefaultSchemeBlock = isLayerDefaultSchemeBlock(i);
      if (res?.assignType === AssignType.Transparent) {
        continue;
      }
      if (res?.assignType === AssignType.Block) {
        return undefined;
      }
      if (!res && isDefaultSchemeBlock) {
        return undefined;
      }
      if (res) {
        return res;
      }
    }
  }
  return undefined;
}

// --------------------------------------------------------------------------------
// operation handlers
const layerState = new (class {
  layerActiveFlags: u16 = 0;
  oneshotLayerIndex: s8 = -1;
  oneshotCancelTick: s8 = -1;
})();

function resetLayerState() {
  layerState.layerActiveFlags = 0;
  const numLayers = getNumLayers();
  for (let i = 0; i < numLayers; i++) {
    const initialActive = getLayerInitialActive(i);
    if (initialActive) {
      layerState.layerActiveFlags |= 1 << i;
    }
  }
  layerState.oneshotLayerIndex = -1;
  layerState.oneshotCancelTick = -1;
}

function getLayerActiveFlags() {
  return layerState.layerActiveFlags;
}

function layerMutations_isActive(layerIndex: number) {
  return ((layerState.layerActiveFlags >> layerIndex) & 1) > 0;
}

function layerMutations_turnOffSiblingLayersIfNeed(layerIndex: number) {
  const targetExclusionGroup = getLayerExclusionGroup(layerIndex);
  if (targetExclusionGroup !== 0) {
    layerMutations_clearExclusive(targetExclusionGroup, layerIndex);
  }
}

function createLayerModifierOutputAction(
  modifiers: u8,
  isDown: boolean,
): OutputKeyStrokeAction {
  return {
    isDown: isDown ? 1 : 0,
    shiftCancel: 0,
    reserved: 0,
    modFlags: modifiers,
    hidKeyCode: 0,
  };
}

function layerMutations_activate(layerIndex: number) {
  if (!layerMutations_isActive(layerIndex)) {
    layerMutations_turnOffSiblingLayersIfNeed(layerIndex);
    layerState.layerActiveFlags |= 1 << layerIndex;
    // console.log(state.layerHoldFlags.map((a) => (a ? 1 : 0)).join(''));
    console.log(`layer on ${layerIndex}`);
    const modifiers = getLayerAttachedModifiers(layerIndex);
    if (modifiers) {
      const action = createLayerModifierOutputAction(modifiers, true);
      keyStrokeActionQueue_enqueueAction(action);
    }
  }
}

function layerMutations_deactivate(layerIndex: number) {
  if (layerMutations_isActive(layerIndex)) {
    layerState.layerActiveFlags &= ~(1 << layerIndex);
    // console.log(state.layerHoldFlags.map((a) => (a ? 1 : 0)).join(''));
    console.log(`layer off ${layerIndex}`);
    const modifiers = getLayerAttachedModifiers(layerIndex);
    if (modifiers) {
      const action = createLayerModifierOutputAction(modifiers, false);
      keyStrokeActionQueue_enqueueAction(action);
    }
  }
}

function layerMutations_toggle(layerIndex: number) {
  !layerMutations_isActive(layerIndex)
    ? layerMutations_activate(layerIndex)
    : layerMutations_deactivate(layerIndex);
}

function layerMutations_oneshot(layerIndex: number) {
  layerMutations_activate(layerIndex);
  layerState.oneshotLayerIndex = layerIndex;
  layerState.oneshotCancelTick = -1;
  console.log('oneshot');
}

function layerMutations_clearOneshot() {
  if (
    layerState.oneshotLayerIndex !== -1 &&
    layerState.oneshotCancelTick === -1
  ) {
    layerState.oneshotCancelTick = 0;
  }
}

function layerMutations_oneshotCancellerTicker(ms: u16) {
  if (
    layerState.oneshotLayerIndex !== -1 &&
    layerState.oneshotCancelTick >= 0
  ) {
    layerState.oneshotCancelTick += ms;
    if (layerState.oneshotCancelTick > 50) {
      console.log(`cancel oneshot`);
      layerMutations_deactivate(layerState.oneshotLayerIndex);
      layerState.oneshotLayerIndex = -1;
      layerState.oneshotCancelTick = -1;
    }
  }
}

function layerMutations_clearExclusive(
  targetExclusiveGroup: number,
  skipLayerIndex: number = -1,
) {
  const numLayers = getNumLayers();
  for (let i = 0; i < numLayers; i++) {
    if (i === skipLayerIndex) {
      continue;
    }
    const groupIndex = getLayerExclusionGroup(i);
    const inGroup = groupIndex === targetExclusiveGroup;
    if (inGroup) {
      layerMutations_deactivate(i);
    }
  }
}

function layerMutations_recoverMainLayerIfAllLayersDisabled() {
  const isAllOff = layerState.layerActiveFlags === 0;
  if (isAllOff) {
    layerMutations_activate(0);
  }
}

const OpType = {
  KeyInput: 1,
  __Reserved: 2,
  ExtendedOperation: 3,
};

const ExOpType = {
  LayerCall: 1,
  LayerClearExclusive: 2,
  SystemAction: 3,
  MovePointerMovement: 4,
};

const InvocationMode = {
  Hold: 1,
  TurnOn: 2,
  TurnOff: 3,
  Toggle: 4,
  Oneshot: 5,
};

function convertSingleModifierToFlags(opWord: u16): u16 {
  const wordBase = opWord & 0xf000;
  let modifiers = (opWord >> 8) & 0x0f;
  let logicalKey = opWord & 0xff;
  if (LogicalKey.LK_Ctrl <= logicalKey && logicalKey <= LogicalKey.LK_Gui) {
    modifiers |= 1 << (logicalKey - LogicalKey.LK_Ctrl);
    logicalKey = 0;
  }
  return wordBase | (modifiers << 8) | logicalKey;
}

function convertKeyInputOperationWordToOutputKeyStrokeAction(
  opWord: u32,
  isDown: boolean,
): OutputKeyStrokeAction {
  const action: OutputKeyStrokeAction = {
    isDown: 0,
    shiftCancel: 0,
    reserved: 0,
    modFlags: 0,
    hidKeyCode: 0,
  };
  action.isDown = isDown ? 1 : 0;
  opWord >>= 16;
  opWord = keyActionRemapper_translateKeyOperation(
    opWord,
    logicOptions.wiringMode,
  );
  opWord = convertSingleModifierToFlags(opWord);
  const logicalKey = opWord & 0xff;
  action.modFlags = (opWord >> 8) & 0b1111;

  if (logicalKey) {
    const isSecondaryLayout = logicOptions.systemLayout === 1;
    const hidKey = keyCodeTranslator_mapLogicalKeyToHidKeyCode(
      logicalKey,
      isSecondaryLayout,
    );
    if (hidKey & 0x200) {
      const { shiftCancelMode } = logicConfig;
      if (shiftCancelMode === ShiftCancelMode.ApplyToShiftLayer) {
        const isBelongToShiftLayer = ((opWord >> 12) & 1) > 0;
        if (isBelongToShiftLayer) {
          action.shiftCancel = 1;
        }
      } else if (shiftCancelMode === ShiftCancelMode.ApplyToAll) {
        action.shiftCancel = 1;
      }
    }
    const shiftOn = (hidKey & 0x100) > 0;
    if (shiftOn) {
      action.modFlags |= ModFlag.Shift;
    }
    const keyCode = hidKey & 0xff;
    if (keyCode) {
      action.hidKeyCode = keyCode;
    }
  }
  return action;
}

function handleOperationOn(opWord: u32) {
  const opType = (opWord >> 30) & 0b11;
  if (opType === OpType.KeyInput) {
    const strokeAction = convertKeyInputOperationWordToOutputKeyStrokeAction(
      opWord,
      true,
    );
    keyStrokeActionQueue_enqueueAction(strokeAction);
  }

  let isLayerCall: boolean = false;

  if (opType === OpType.ExtendedOperation) {
    const exOpType = (opWord >> 24) & 0b111;
    if (exOpType === ExOpType.LayerCall) {
      isLayerCall = true;
      opWord >>= 16;
      const fInvocationMode = (opWord >> 4) & 0b1111;
      const layerIndex = opWord & 0b1111;

      if (fInvocationMode === InvocationMode.Hold) {
        layerMutations_activate(layerIndex);
      } else if (fInvocationMode === InvocationMode.TurnOn) {
        layerMutations_activate(layerIndex);
      } else if (fInvocationMode === InvocationMode.TurnOff) {
        layerMutations_deactivate(layerIndex);
      } else if (fInvocationMode === InvocationMode.Toggle) {
        layerMutations_toggle(layerIndex);
      } else if (fInvocationMode === InvocationMode.Oneshot) {
        layerMutations_oneshot(layerIndex);
      }
    }

    if (exOpType === ExOpType.LayerClearExclusive) {
      opWord >>= 16;
      const targetGroup = opWord & 0b111;
      layerMutations_clearExclusive(targetGroup);
    }
    if (exOpType === ExOpType.SystemAction) {
      const actionCode = (opWord >> 16) & 0xff;
      const payloadValue = (opWord >> 8) & 0xff;
      console.log(`system action ${actionCode}`);
    }
  }

  if (!isLayerCall) {
    layerMutations_clearOneshot();
  }
  layerMutations_recoverMainLayerIfAllLayersDisabled();
}

function handleOperationOff(opWord: u32) {
  const opType = (opWord >> 30) & 0b11;
  if (opType === OpType.KeyInput) {
    const strokeAction = convertKeyInputOperationWordToOutputKeyStrokeAction(
      opWord,
      false,
    );
    keyStrokeActionQueue_enqueueAction(strokeAction);
  }
  if (opType === OpType.ExtendedOperation) {
    const exOpType = (opWord >> 24) & 0b111;
    if (exOpType === ExOpType.LayerCall) {
      opWord >>= 16;
      const fInvocationMode = (opWord >> 4) & 0b1111;
      const layerIndex = opWord & 0b1111;
      if (fInvocationMode === InvocationMode.Hold) {
        layerMutations_deactivate(layerIndex);
      }
    }
  }
  layerMutations_recoverMainLayerIfAllLayersDisabled();
}

// --------------------------------------------------------------------------------
// assign binder

const KeyIndexNone = 255;
const NumKeySlotsMax = 10;
interface KeySlot {
  isActive: boolean;
  hold: boolean;
  nextHold: boolean;
  interrupted: boolean;
  resolving: boolean;
  inputEdge: u8;
  keyIndex: u8;
  steps: string;
  tick: u16;
  liveLayerIndex: s8;
  liveLayerStateFlags: u16;
  resolverProc: ((slot: KeySlot) => boolean) | undefined;
  opWord: u32;
}

function assignBinder_handleKeyOn(slot: KeySlot, opWord: u32) {
  // console.log(`keyOn ${keyIndex} ${opWord}`);
  handleOperationOn(opWord);
  slot.opWord = opWord;
}

function assignBinder_handleKeyOff(slot: KeySlot) {
  if (slot.opWord) {
    // console.log(`keyOff ${keyIndex} ${opWord}`);
    handleOperationOff(slot.opWord);
    slot.opWord = 0;
  }
}

// --------------------------------------------------------------------------------
// resolver common

const ShiftCancelMode = {
  None: 0,
  ApplyToShiftLayer: 1,
  ApplyToAll: 2,
};

const logicConfig = {
  shiftCancelMode: ShiftCancelMode.None,
  tapHoldThresholdMs: 200,
  useInterruptHold: true,
};

const InputEdge = {
  None: 0,
  Down: 1,
  Up: 2,
};

const AssignOrder = {
  Pri: 1,
  Sec: 2,
  Ter: 3,
};

const resolverConfig = {
  debugShowTrigger: false,
  emitOutputStroke: true,
};
// resolverConfig.debugShowTrigger = true;
// resolverConfig.emitOutputStroke = false;KeyIndexNone
const resolverState = new (class {
  interruptKeyIndex: number = KeyIndexNone;
  keySlots: KeySlot[] = [];
})();

function initResolverState() {
  resolverState.interruptKeyIndex = KeyIndexNone;
  resolverState.keySlots = Array(NumKeySlotsMax)
    .fill(0)
    .map((_, i) => ({
      isActive: false,
      keyIndex: KeyIndexNone,
      steps: '',
      hold: false,
      nextHold: false,
      tick: 0,
      interrupted: false,
      resolving: false,
      liveLayerIndex: -1,
      liveLayerStateFlags: 0,
      resolverProc: undefined,
      inputEdge: 0,
      opWord: 0,
      autoReleaseTick: 0,
    }));
}

function keySlot_attachKey(slot: KeySlot, keyIndex: number) {
  slot.isActive = true;
  slot.keyIndex = keyIndex;
  slot.steps = '';
  slot.hold = false;
  slot.nextHold = false;
  slot.tick = 0;
  slot.interrupted = false;
  slot.resolving = false;
  slot.liveLayerIndex = -1;
  slot.liveLayerStateFlags = 0;
  slot.resolverProc = undefined;
  slot.inputEdge = 0;
  slot.opWord = 0;
}

function keySlot_handleKeyOn(slot: KeySlot, order: u8) {
  const assignSet = findAssignInLayerStack(
    slot.keyIndex,
    slot.liveLayerStateFlags,
  );
  if (assignSet) {
    if (order === AssignOrder.Pri) {
      assignBinder_handleKeyOn(slot, assignSet.pri);
    } else if (order === AssignOrder.Sec) {
      assignBinder_handleKeyOn(slot, assignSet.sec);
    } else if (order === AssignOrder.Ter) {
      assignBinder_handleKeyOn(slot, assignSet.ter);
    }
  }
}

function keySlot_handleKeyOff(slot: KeySlot) {
  assignBinder_handleKeyOff(slot);
}

function keySlot_clearSteps(slot: KeySlot) {
  slot.steps = '';
}

function keySlot_debugShowSlotTrigger(slot: KeySlot, triggerObj: any) {
  const trigger = getFieldNameByValue(triggerObj, slot.steps) || '--';
  console.log(`[TRIGGER] ${slot.keyIndex} ${slot.steps} ${trigger}`);
}

// --------------------------------------------------------------------------------
// resolver dummy

function keySlot_dummyResolver(slot: KeySlot): boolean {
  if (slot.inputEdge === InputEdge.Up) {
    return true;
  }
  return false;
}

// --------------------------------------------------------------------------------
// resolver single

const TriggerA = {
  Down: 'D',
  Up: 'U',
};

function keySlot_pushStepA(slot: KeySlot, step: 'D' | 'U' | '_') {
  slot.steps += step;

  if (resolverConfig.debugShowTrigger) {
    keySlot_debugShowSlotTrigger(slot, TriggerA);
  }

  const { steps } = slot;

  if (resolverConfig.emitOutputStroke) {
    if (steps === TriggerA.Down) {
      keySlot_handleKeyOn(slot, AssignOrder.Pri);
    }

    if (steps === TriggerA.Up) {
      keySlot_handleKeyOff(slot);
    }
  }
}

function keySlot_singleResolverA(slot: KeySlot): boolean {
  const { inputEdge } = slot;

  if (inputEdge === InputEdge.Down) {
    keySlot_clearSteps(slot);
    keySlot_pushStepA(slot, 'D');
  }
  if (inputEdge === InputEdge.Up) {
    keySlot_clearSteps(slot);
    keySlot_pushStepA(slot, 'U');
    return true;
  }
  return false;
}

// --------------------------------------------------------------------------------
// resolver dual

const TriggerB = {
  Down: 'D',
  Tap: 'DU',
  Hold: 'D_',
  Rehold: 'DUD',
  Up: 'U',
};

function keySlot_pushStepB(slot: KeySlot, step: 'D' | 'U' | '_') {
  slot.steps += step;
  slot.tick = 0;

  if (resolverConfig.debugShowTrigger) {
    keySlot_debugShowSlotTrigger(slot, TriggerB);
  }

  const { steps } = slot;

  if (resolverConfig.emitOutputStroke) {
    if (steps === TriggerB.Down) {
    }

    if (steps === TriggerB.Tap) {
      keySlot_handleKeyOn(slot, AssignOrder.Pri);
      keySlot_handleKeyOff(slot);
    }

    if (steps === TriggerB.Hold) {
      keySlot_handleKeyOn(slot, AssignOrder.Sec);
    }

    if (steps === TriggerB.Rehold) {
      keySlot_handleKeyOn(slot, AssignOrder.Pri);
    }

    if (steps === TriggerB.Up) {
      keySlot_handleKeyOff(slot);
    }
  }
}

function keySlot_dualResolverB(slot: KeySlot): boolean {
  const { inputEdge, hold, steps, tick, interrupted } = slot;
  const { tapHoldThresholdMs } = logicConfig;

  if (inputEdge === InputEdge.Down) {
    if (steps === 'DU' && tick < tapHoldThresholdMs) {
      // tap-rehold
      keySlot_pushStepB(slot, 'D');
    } else {
      // down
      keySlot_clearSteps(slot);
      keySlot_pushStepB(slot, 'D');
    }
  }

  if (steps === 'D' && hold && tick >= tapHoldThresholdMs) {
    // hold
    keySlot_pushStepB(slot, '_');
  }

  if (steps === 'D' && hold && tick < tapHoldThresholdMs && interrupted) {
    // interrupt hold
    keySlot_pushStepB(slot, '_');
  }

  if (steps === 'DU' && !hold && tick >= tapHoldThresholdMs) {
    // silent after tap
    keySlot_pushStepB(slot, '_');
    return true;
  }

  if (inputEdge === InputEdge.Up) {
    if (steps === 'D' && tick < tapHoldThresholdMs) {
      // tap
      keySlot_pushStepB(slot, 'U');
    }
    if (steps === 'D_' || steps === 'DUD') {
      // hold up, rehold up
      keySlot_clearSteps(slot);
      keySlot_pushStepB(slot, 'U');
      return true;
    }
  }
  return false;
}

// --------------------------------------------------------------------------------
// resolver triple

const TriggerC = {
  Down: 'D',
  Hold: 'D_',
  Tap: 'DU_',
  Hold2: 'DUD_',
  Tap2: 'DUDU',
  Up: 'U',
};

function keySlot_pushStepC(slot: KeySlot, step: 'D' | 'U' | '_') {
  slot.steps += step;
  slot.tick = 0;

  if (resolverConfig.debugShowTrigger) {
    keySlot_debugShowSlotTrigger(slot, TriggerC);
  }

  const { steps } = slot;

  if (resolverConfig.emitOutputStroke) {
    if (steps === TriggerC.Down) {
    }

    if (steps === TriggerC.Tap) {
      keySlot_handleKeyOn(slot, AssignOrder.Pri);
      keySlot_handleKeyOff(slot);
    }

    if (steps === TriggerC.Hold) {
      keySlot_handleKeyOn(slot, AssignOrder.Sec);
    }

    if (steps === TriggerC.Hold2) {
      keySlot_handleKeyOn(slot, AssignOrder.Pri);
    }

    if (steps === TriggerC.Tap2) {
      keySlot_handleKeyOn(slot, AssignOrder.Ter);
      keySlot_handleKeyOff(slot);
    }

    if (steps === TriggerC.Up) {
      keySlot_handleKeyOff(slot);
    }
  }
}
function keySlot_tripleResolverC(slot: KeySlot): boolean {
  const { inputEdge, steps, tick, hold, interrupted } = slot;
  const { tapHoldThresholdMs } = logicConfig;

  if (inputEdge === InputEdge.Down) {
    if (steps === 'DU' && tick < tapHoldThresholdMs) {
      // down2
      keySlot_pushStepC(slot, 'D');
    } else {
      // down
      keySlot_clearSteps(slot);
      keySlot_pushStepC(slot, 'D');
    }
  }

  if (steps === 'D' && hold && tick >= tapHoldThresholdMs) {
    // hold
    keySlot_pushStepC(slot, '_');
  }

  if (steps === 'D' && hold && tick < tapHoldThresholdMs && interrupted) {
    // interrupt hold
    keySlot_pushStepC(slot, '_');
  }

  if (steps === 'DUD' && hold && tick >= tapHoldThresholdMs) {
    // hold2
    keySlot_pushStepC(slot, '_');
  }

  if (steps === 'DU' && !hold && tick >= tapHoldThresholdMs) {
    // silent after single tap
    keySlot_pushStepC(slot, '_');
    return true;
  }

  if (inputEdge === InputEdge.Up) {
    if (steps === 'DUD' && tick < tapHoldThresholdMs) {
      // double-tap
      keySlot_pushStepC(slot, 'U');
      return true;
    } else if (steps === 'D' && tick < tapHoldThresholdMs) {
      // tap
      keySlot_pushStepC(slot, 'U');
    } else {
      // up
      keySlot_clearSteps(slot);
      keySlot_pushStepC(slot, 'U');
      return true;
    }
  }

  return false;
}

// --------------------------------------------------------------------------------
// resolver root

const keySlotResolverFuncs = [
  keySlot_dummyResolver,
  keySlot_singleResolverA,
  keySlot_dualResolverB,
  keySlot_tripleResolverC,
];

function keySlot_tick(slot: KeySlot, ms: number) {
  slot.tick += ms;

  slot.inputEdge = InputEdge.None;
  if (!slot.hold && slot.nextHold) {
    slot.hold = true;
    slot.inputEdge = InputEdge.Down;
  }
  if (slot.hold && !slot.nextHold) {
    slot.hold = false;
    slot.inputEdge = InputEdge.Up;
  }

  const interrupt_key_index = resolverState.interruptKeyIndex;
  if (logicConfig.useInterruptHold) {
    slot.interrupted =
      interrupt_key_index !== -1 && interrupt_key_index !== slot.keyIndex;
  }

  if (!slot.resolverProc && slot.inputEdge === InputEdge.Down) {
    const assignSet = findAssignInLayerStack(
      slot.keyIndex,
      layerState.layerActiveFlags,
    );
    if (assignSet) {
      slot.liveLayerIndex = assignSet.layerIndex;
      slot.liveLayerStateFlags = layerState.layerActiveFlags;
      slot.resolverProc = keySlotResolverFuncs[assignSet.assignType];
      if (resolverConfig.debugShowTrigger) {
        console.log(
          `resolver attached ${slot.keyIndex} ${assignSet.assignType}`,
        );
      }
    }
  }

  if (slot.resolverProc) {
    const done = slot.resolverProc(slot);
    if (done) {
      slot.liveLayerIndex = -1;
      slot.liveLayerStateFlags = 0;
      slot.resolverProc = undefined;
      if (resolverConfig.debugShowTrigger) {
        console.log(`resolver detached ${slot.keyIndex}`);
      }
    }
  }
}

function triggerResolver_tick(ms: number) {
  const rs = resolverState;
  rs.keySlots.forEach((slot) => {
    if (slot.isActive && slot.keyIndex !== rs.interruptKeyIndex) {
      keySlot_tick(slot, ms);
    }
  });
  rs.keySlots.forEach((slot) => {
    if (slot.isActive && slot.keyIndex === rs.interruptKeyIndex) {
      keySlot_tick(slot, ms);
    }
  });
  resolverState.interruptKeyIndex = -1;

  rs.keySlots.forEach((slot) => {
    if (slot.isActive && !slot.hold && slot.resolverProc === undefined) {
      // console.log(`key ${slot.keyIndex} detached from slot`);
      slot.isActive = false;
    }
  });
}

function triggerResolver_attachKeyToFreeSlot(
  keyIndex: number,
): KeySlot | undefined {
  const slot = resolverState.keySlots.find((ks) => !ks.isActive);
  if (slot) {
    keySlot_attachKey(slot, keyIndex);
    // console.log(`key ${keyIndex} attached to slot`);
    return slot;
  }
  return undefined;
}

function triggerResolver_getActiveKeySlotByKeyIndex(
  keyIndex: number,
): KeySlot | undefined {
  return resolverState.keySlots.find(
    (ks) => ks.isActive && ks.keyIndex === keyIndex,
  );
}

function triggerResolver_handleKeyInput(keyIndex: u8, isDown: boolean) {
  if (isDown) {
    console.log(`down ${keyIndex}`);
    const slot =
      triggerResolver_getActiveKeySlotByKeyIndex(keyIndex) ||
      triggerResolver_attachKeyToFreeSlot(keyIndex);
    if (slot) {
      resolverState.interruptKeyIndex = keyIndex;
      slot.nextHold = true;
    } else {
      console.log(`cannot attach key ${keyIndex} to slot`);
    }
  } else {
    console.log(`up ${keyIndex}`);
    const slot = triggerResolver_getActiveKeySlotByKeyIndex(keyIndex);
    if (slot) {
      slot.nextHold = false;
    }
  }
}

// --------------------------------------------------------------------------------
// entries

let logicActive: boolean = false;

function keyboardCoreLogic_initialize() {
  initAssignMemoryReader();
  resetHidReportState();
  resetLayerState();
  initResolverState();
  logicActive = true;
}

function keyboardCoreLogic_getOutputHidReportBytes(): number[] {
  if (logicActive) {
    keyStrokeActionQueue_shiftQueuedActionOne();
    return getOutputHidReport();
  } else {
    return getOutputHidReportZeros();
  }
}

function keyboardCoreLogic_getLayerActiveFlags(): number {
  if (logicActive) {
    return getLayerActiveFlags();
  } else {
    return 0;
  }
}

function keyboardCoreLogic_issuePhysicalKeyStateChanged(
  keyIndex: number,
  isDown: boolean,
) {
  if (logicActive) {
    triggerResolver_handleKeyInput(keyIndex, isDown);
  }
}

function keyboardCoreLogic_processTicker(ms: number) {
  if (logicActive) {
    triggerResolver_tick(ms);
    layerMutations_oneshotCancellerTicker(ms);
  }
}

function keyboardCoreLogic_halt() {
  logicActive = false;
}

export function getKeyboardCoreLogicInterface(): KeyboardCoreLogicInterface {
  return {
    keyboardCoreLogic_initialize,
    keyboardCoreLogic_setSystemLayout: setSystemLayout,
    keyboardCoreLogic_setWiringMode: setWiringMode,
    keyboardCoreLogic_getOutputHidReportBytes,
    keyboardCoreLogic_getLayerActiveFlags,
    keyboardCoreLogic_issuePhysicalKeyStateChanged,
    keyboardCoreLogic_processTicker,
    keyboardCoreLogic_halt,
  };
}
