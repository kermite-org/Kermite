import {
  ConfigStorageFormatRevision,
  createDictionaryFromKeyValues,
  createGroupedArrayByKey,
  flattenArray,
  IAssignEntry,
  IAssignOperation,
  IProfileData,
  isModifierVirtualKey,
  LayerInvocationMode,
  ProfileBinaryFormatRevision,
  sortOrderBy,
  getLogicalKeyForVirtualKey,
  routerConstants,
  systemActionToCodeMap,
  encodeModifierVirtualKeys,
} from '~/shared';
import {
  writeBytes,
  writeUint16LE,
  writeUint8,
} from '~/shell/services/keyboardDevice/Helpers';

const logicConfig = new (class {
  primaryDefaultTrigger: 'down' | 'tap' = 'down';
  secondaryDefaultTrigger: 'down' | 'hold' = 'down';
})();
// logicConfig.primaryDefaultTrigger = 'tap';
// logicConfig.secondaryDefaultTrigger = 'hold';

/*
Key Assigns Restriction
supports max 16 Layers
supports max 255 Keys
layerIndex: 0~15
keyIndex: 0~254
*/

interface IRawAssignEntry {
  keyId: string;
  keyIndex: number;
  layerId: string;
  layerIndex: number;
  entry: IAssignEntry;
}

interface IRawLayerInfo {
  layerIndex: number;
  isShiftLayer: boolean;
}

type IProfileContext = {
  layersDict: { [layerId: string]: IRawLayerInfo };
  useShiftCancel: boolean;
};

function makeLayerInvocationModeBits(mode: LayerInvocationMode): number {
  const mapper: { [key in LayerInvocationMode]: number } = {
    hold: 1,
    turnOn: 2,
    turnOff: 3,
    toggle: 4,
    oneshot: 5,
  };
  return mapper[mode] || 0;
}

// 単独のモディファイヤキーの扱い
// ctrl/shift/alt/osをキーコード224,225,226,227で出力
const encodeSoloModifierActionToModifierFlags = false;
// ctrl/shift/alt/osをモディファイヤキーのフラグとして埋め込む
// const encodeSoloModifierActionToModifierFlags = true;

/*
noOperation
0bTTxx_xxxx
0b00~
TT: type, 0b00 for no operation

keyInput (logicalKey)
0bTTxS_MMMM 0bKKKK_KKKK
0b01~
TT: type, 0b01 for keyInput
S: isShiftLayer
MMMM: modifiers, [os, alt, shift, ctrl] for msb-lsb
KKKK_KKKK: logical keycode

layerCall
0bTTxx_xFFF 0bIIII_LLLL
0b11xx_x001 ~
TT: type, 0b11 for extended operations
FFF: extended operation type, 0b001 for layer call
LLLL: layerIndex
IIII: invocation mode
 1: hold
 2: turnOn
 3: turnOff
 4: toggle
 5: oneshot

layerClearExclusive
0bTTxx_xFFF 0bxxxx_xQQQ
0b11xx_x010 ~
TT: type, 0b11 for extended operations
FFF: extended operation type, 0b010 for layer clear exclusive
QQQ: target exclusion group

SystemAction
0bTTxx_xFFF CCCC_CCCC VVVV_VVVV
0b11xx_x011 ~
TT: type, 0b10 for extended operations
FFF: extended operation type, 0b011 for user system action
CCCC_CCCC: system action code
VVVV_VVVV: payload value

MousePointerMovement (NOT IMPLEMENTED YET)
0bTTxx_xFFF AAAA_AAAA BBBB_BBBB
0b11xx_x100 ~
TT: type, 0b11 for extended operations
FFF: extended operation type, 0b100 for mouse pointer movement
AAAA_AAAA: movement amount x, -128~127
BBBB_BBBB: movement amount y, -128~127

*/
function encodeAssignOperation(
  op: IAssignOperation | undefined,
  layer: IRawLayerInfo,
  context: IProfileContext,
): number[] {
  if (op?.type === 'keyInput') {
    const fAssignType = 0b01;
    const vk = op.virtualKey;
    if (encodeSoloModifierActionToModifierFlags) {
      if (isModifierVirtualKey(vk)) {
        const modifiers = encodeModifierVirtualKeys([vk]);
        return [(fAssignType << 6) | modifiers, 0];
      }
    }
    const modifiers = op.attachedModifiers;
    const logicalKey = getLogicalKeyForVirtualKey(vk);
    // ShiftCancelオプションが有効でshiftレイヤの場合のみ、shiftCancelを適用可能にする
    const fIsShiftCancellable =
      context.useShiftCancel && layer.isShiftLayer ? 1 : 0;
    return [
      (fAssignType << 6) | (fIsShiftCancellable << 4) | modifiers,
      logicalKey,
    ];
  }
  if (op?.type === 'layerCall') {
    const fAssignType = 0b11;
    const fExOperationType = 0b001;
    const layerInfo = context.layersDict[op.targetLayerId];
    if (layerInfo) {
      const { layerIndex } = layerInfo;
      const fInvocationMode = makeLayerInvocationModeBits(op.invocationMode);
      return [
        (fAssignType << 6) | fExOperationType,
        (fInvocationMode << 4) | layerIndex,
      ];
    }
  }
  if (op?.type === 'layerClearExclusive') {
    const fAssignType = 0b11;
    const fExOperationType = 0b010;
    const targetGroup = op.targetExclusionGroup;
    return [(fAssignType << 6) | fExOperationType, targetGroup];
  }
  if (op?.type === 'systemAction') {
    const fAssignType = 0b11;
    const fExOperationType = 0b011;
    const actionCode = systemActionToCodeMap[op.action] || 0;
    return [(fAssignType << 6) | fExOperationType, actionCode, op.payloadValue];
  }
  return [0];
}

function encodeNoAssignOperation(): number[] {
  return [0];
}

function encodeOperationWordLengths(operationWordLengths: number[]) {
  let value = 0;
  const szPri = operationWordLengths[0];
  const szSec = operationWordLengths[1] || 0;
  const szTer = operationWordLengths[2] || 0;
  value |= (szPri - 1) << 6;
  value |= szSec << 3;
  value |= szTer;
  return value;
}

type IAssignType = 'single' | 'dual' | 'triple' | 'block' | 'transparent';

/*
rawAssignEntryHeader
0b1TTT_LLLL <0bAABB_BCCC>
TTT: type
 0: reserved
 1: single
 2: dual
 3: triple
 4: block
 5: transparent
LLLL: layerIndex
AABBBCCC: set of operation data length, exist when single/dual/triple assign
AA: tertiary operation data length, (0: 1byte, 1:2byte, 2:3byte, 3:4byte)
BBB: secondary operation data length, (0: 0byte, 1:1byte, 2:2byte, 3:3byte, 4:4byte)
CCC: primary operation data length, (0: 0byte, 1:1byte, 2:2byte, 3:3byte, 4:4byte)
*/
function encodeRawAssignEntryHeaderBytes(
  type: IAssignType,
  layerIndex: number,
  operationWordLengths?: number[],
): number[] {
  const assignType = {
    single: 1,
    dual: 2,
    triple: 3,
    block: 4,
    transparent: 5,
  }[type];
  const firstByte = (1 << 7) | (assignType << 4) | layerIndex;
  const hasSecondByte = [1, 2, 3].includes(assignType);
  return hasSecondByte && operationWordLengths
    ? [firstByte, encodeOperationWordLengths(operationWordLengths)]
    : [firstByte];
}

function encodeRawAssignOperations(
  assignType: IAssignType,
  layerIndex: number,
  operationWords: number[][],
): number[] {
  return [
    ...encodeRawAssignEntryHeaderBytes(
      assignType,
      layerIndex,
      operationWords.map((it) => it.length),
    ),
    ...flattenArray(operationWords),
  ];
}

/*
rawAssignEntry
0x~ HH, for block and transparent assign entry
0x~ HH DD, PP <PP PP PP>, for single assign entry
0x~ HH DD, PP <PP PP PP>, SS <SS SS SS>, for dual assign entry
0x~ HH DD, PP <PP PP PP>, SS <SS SS SS>, TT <TT TT TT>, for triple assign entry
HH: assign entry header
DD: assign entry body length
PP: primary operation (variable length, 1~4bytes)
SS: secondary operation (variable length, 1~4bytes)
TT: tertiary operation (variable length, 1~4bytes)
*/
function encodeRawAssignEntry(
  ra: IRawAssignEntry,
  context: IProfileContext,
): number[] {
  const { entry } = ra;
  const layer = context.layersDict[ra.layerId];
  if (entry.type === 'block') {
    return encodeRawAssignEntryHeaderBytes('block', ra.layerIndex);
  } else if (entry.type === 'transparent') {
    return encodeRawAssignEntryHeaderBytes('transparent', ra.layerIndex);
  } else if (entry.type === 'single') {
    // single
    return encodeRawAssignOperations('single', ra.layerIndex, [
      encodeAssignOperation(entry.op, layer, context),
    ]);
  } else {
    // dual
    if (entry.tertiaryOp) {
      return encodeRawAssignOperations('triple', ra.layerIndex, [
        encodeAssignOperation(entry.primaryOp, layer, context),
        encodeAssignOperation(entry.secondaryOp, layer, context),
        encodeAssignOperation(entry.tertiaryOp, layer, context),
      ]);
    } else if (entry.primaryOp && entry.secondaryOp) {
      return encodeRawAssignOperations('dual', ra.layerIndex, [
        encodeAssignOperation(entry.primaryOp, layer, context),
        encodeAssignOperation(entry.secondaryOp, layer, context),
      ]);
    } else if (entry.secondaryOp) {
      // secondary only
      if (logicConfig.secondaryDefaultTrigger === 'hold') {
        return encodeRawAssignOperations('dual', ra.layerIndex, [
          encodeNoAssignOperation(),
          encodeAssignOperation(entry.secondaryOp, layer, context),
        ]);
      } else {
        return encodeRawAssignOperations('single', ra.layerIndex, [
          encodeAssignOperation(entry.secondaryOp, layer, context),
        ]);
      }
    } else {
      // primary only
      if (logicConfig.primaryDefaultTrigger === 'tap') {
        return encodeRawAssignOperations('dual', ra.layerIndex, [
          encodeAssignOperation(entry.primaryOp, layer, context),
          encodeNoAssignOperation(),
        ]);
      } else {
        return encodeRawAssignOperations('single', ra.layerIndex, [
          encodeAssignOperation(entry.primaryOp, layer, context),
        ]);
      }
    }
  }
}

/*

0b1SSS_SSSS 0bKKKK_KKKK
SSS_SSSS: body length
KKKK_KKKK: keyIndex
*/
function encodeKeyBoundAssignsSetHeder(
  keyIndex: number,
  bodyLength: number,
): number[] {
  if (bodyLength > 127) {
    throw new Error(
      `key bound assign size overrun, keyIndex: ${keyIndex}, bodyLength: ${bodyLength}/127`,
    );
  }
  return [(1 << 7) | bodyLength, keyIndex];
}

/*
0x~ HH HH VV VV ...
HH HH: header bytes
VV VV ...: body bytes, variable length
*/
function encodeKeyBoundAssignsSet(
  assigns: IRawAssignEntry[],
  context: IProfileContext,
): number[] {
  const { keyIndex } = assigns[0];
  const bodyBytes = [
    ...flattenArray(
      assigns.map((assign) => encodeRawAssignEntry(assign, context)),
    ),
  ];
  const headBytes = encodeKeyBoundAssignsSetHeder(keyIndex, bodyBytes.length);
  return [...headBytes, ...bodyBytes];
}

function makeRawAssignEntries(profile: IProfileData): IRawAssignEntry[] {
  const {
    assigns,
    layers,
    keyboardDesign: { keyEntities },
  } = profile;

  return Object.keys(assigns)
    .map((key) => {
      const [layerId, keyId] = key.split('.');
      const layerIndex = layers.findIndex((la) => la.layerId === layerId);
      const keyEntity = keyEntities.find((ke) => ke.keyId === keyId);
      const keyIndex =
        keyEntity?.keyIndex !== undefined ? keyEntity.keyIndex : -1;
      const entry = assigns[key];
      if (layerIndex !== -1 && keyIndex !== -1 && entry) {
        return {
          keyId,
          keyIndex,
          layerId,
          layerIndex,
          entry,
        };
      }
      return undefined!;
    })
    .filter((ra) => !!ra);
}

function createProfileContext(profile: IProfileData): IProfileContext {
  const layersDict = createDictionaryFromKeyValues(
    profile.layers.map((la, idx) => [
      la.layerId,
      {
        layerIndex: idx,
        isShiftLayer: (la.attachedModifiers & 0b0010) > 0,
      },
    ]),
  );
  const useShiftCancel = profile.settings.useShiftCancel;
  return {
    layersDict,
    useShiftCancel,
  };
}

function encodeKeyMappingData(profile: IProfileData): number[] {
  const context = createProfileContext(profile);
  const numLayers = profile.layers.length;
  const rawAssigns = makeRawAssignEntries(profile);
  rawAssigns.sort(
    sortOrderBy((ra) => ra.keyIndex * 100 + (numLayers - ra.layerIndex)),
  );
  // console.log(rawAssigns);
  const groupedAssignBytes = createGroupedArrayByKey(
    rawAssigns,
    'keyIndex',
  ).map((assign) => encodeKeyBoundAssignsSet(assign, context));
  // console.log(groupedAssignBytes.map((a) => hexBytes(a, ' ')));
  return flattenArray(groupedAssignBytes);
}

function createChunk(headerWord: number, bodyBytes: number[]) {
  const buffer = Array(bodyBytes.length + 4).fill(0);
  writeUint16LE(buffer, 0, headerWord);
  writeUint16LE(buffer, 2, bodyBytes.length);
  writeBytes(buffer, 4, bodyBytes);
  return buffer;
}

function encodeProfileHeaderData(profile: IProfileData): number[] {
  const numKeys = profile.keyboardDesign.keyEntities.length;
  const numLayers = profile.layers.length;
  const buffer = Array(5).fill(0);
  writeUint8(buffer, 0, 0x01);
  writeUint8(buffer, 1, ConfigStorageFormatRevision);
  writeUint8(buffer, 2, ProfileBinaryFormatRevision);
  writeUint8(buffer, 3, numKeys);
  writeUint8(buffer, 4, numLayers);
  return buffer;
}

// LayerAttributeByte
// 0bDxIx_MMMM 0bxxxx_xQQQ
// D: default scheme, 0 for transparent, 1 for block
// I: initialActive
// MMMM: attachedModifiers
// QQQ: exclusion group, 0~7
function encodeLayerListData(profile: IProfileData): number[] {
  return flattenArray(
    profile.layers.map((la) => {
      const fDefaultScheme = la.defaultScheme === 'block' ? 1 : 0;
      const fInitialActive = la.initialActive ? 1 : 0;
      const fAttachedModifiers = la.attachedModifiers;
      return [
        (fDefaultScheme << 7) | (fInitialActive << 5) | fAttachedModifiers,
        la.exclusionGroup,
      ];
    }),
  );
}

function encodeMappingEntriesData(profile: IProfileData): number[] {
  const filteredEntries = profile.mappingEntries.filter((it) => {
    const noTargetKey =
      it.srcKey === 'K_NONE' || it.srcKey === 'K_RoutingSource_Any';
    const noTargetModifiers =
      it.srcModifiers === routerConstants.ModifierSourceValueNone ||
      it.srcModifiers === routerConstants.ModifierSourceValueAny;
    return !(noTargetKey && noTargetModifiers);
  });
  const numItems = filteredEntries.length;
  if (numItems > 255) {
    throw new Error('too many mapping entries');
  }
  const itemBytes: number[] = flattenArray(
    filteredEntries.map((it) => [
      it.channelIndex,
      getLogicalKeyForVirtualKey(it.srcKey),
      it.srcModifiers,
      getLogicalKeyForVirtualKey(it.dstKey),
      it.dstModifiers,
    ]),
  );
  return [numItems, ...itemBytes];
}

export function makeProfileBinaryData(profile: IProfileData): number[] {
  const data = [
    ...createChunk(0xbb71, encodeProfileHeaderData(profile)),
    ...createChunk(0xbb74, encodeLayerListData(profile)),
    ...createChunk(0xbb76, encodeMappingEntriesData(profile)),
    ...createChunk(0xbb78, encodeKeyMappingData(profile)),
  ];
  // console.log(`profile binary data, ${data.length} bytes`);
  return data;
}
