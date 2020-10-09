import { IKeyboardLayoutStandard } from '~defs/ConfigTypes';
import { getHidKeyCodeEx } from '~defs/HidKeyCodes';
import {
  IProfileData,
  IAssignEntry,
  IAssignOperation,
  LayerInvocationMode
} from '~defs/ProfileData';
import { ModifierVirtualKey, isModifierVirtualKey } from '~defs/VirtualKeys';
import {
  createDictionaryFromKeyValues,
  sortOrderBy,
  flattenArray,
  createGroupedArrayByKey,
  duplicateObjectByJsonStringifyParse
} from '~funcs/Utils';

/*
Key Assigns Restriction
supports max 16 Layers
supports max 128 Keys
layerIndex: 0~15
keyIndex: 0~127
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

const localContext = new (class {
  layoutStandard: IKeyboardLayoutStandard = 'US';
  layersDict: { [layerId: string]: IRawLayerInfo } = {};
  useShiftCancel: boolean = false;
})();

function makeAttachedModifiersBits(
  attachedModifiers?: ModifierVirtualKey[]
): number {
  let bits = 0;
  if (attachedModifiers) {
    for (const m of attachedModifiers) {
      m === 'K_Ctrl' && (bits |= 0x01);
      m === 'K_Shift' && (bits |= 0x02);
      m === 'K_Alt' && (bits |= 0x04);
      m === 'K_OS' && (bits |= 0x08);
    }
  }
  return bits;
}

function makeLayerInvocationModeBits(mode: LayerInvocationMode): number {
  const mapper: { [key in LayerInvocationMode]: number } = {
    hold: 1,
    turnOn: 2,
    turnOff: 3,
    toggle: 4,
    base: 5,
    oneshot: 6,
    exclusive: 7
  };
  return mapper[mode] || 0;
}

/*
noOperation
0bTTXX_XXXX 0bXXXX_XXXX
TT: type, 0b00 for noOperation

keyInput
0bTTMM_MMKK 0bKKKK_KKKK
TT: type, 0b01 for keyInput
MMMM: modifiers, [os, alt, shift, ctrl] for msb-lsb
KK_KKKK_KKKK: hid keycode with adhocShift flags

layerCall
0bTTxx_LLLL 0bIIII_xxxx
TT: type, 0b10 for layerCall
LLLL: layerIndex
IIII: invocation mode
 1: hold
 2: turnOn
 3: turnOff
 4: toggle
 5: base
 6: oneshot
 7: exclusive

layerClearExclusive
0bTTxx_xQQQ 0bxxx_xxxx
TT: type, 0b11 for layerClearExclusive
QQQ: target exclusion group
*/
function encodeAssignOperation(
  op: IAssignOperation | undefined,
  layer: IRawLayerInfo
): number[] {
  if (op?.type === 'keyInput') {
    const fAssignType = 0b01;
    const vk = op.virtualKey;
    if (isModifierVirtualKey(vk)) {
      const mods = makeAttachedModifiersBits([vk]);
      return [(fAssignType << 6) | (mods << 2), 0];
    } else {
      const { layoutStandard, useShiftCancel } = localContext;
      const mods = makeAttachedModifiersBits(op.attachedModifiers);
      let hidKey = getHidKeyCodeEx(vk, layoutStandard);

      if (!(useShiftCancel && layer.isShiftLayer)) {
        // ShiftCancelオプションが有効で、shiftレイヤの場合のみ、shift cancel bitを維持
        // そうでない場合はshift cancel bitを削除
        hidKey = hidKey & 0x1ff;
      }
      return [
        (fAssignType << 6) | (mods << 2) | ((hidKey >> 8) & 0x03),
        hidKey
      ];
    }
  }
  if (op?.type === 'layerCall') {
    const fAssignType = 0b10;
    const layerInfo = localContext.layersDict[op.targetLayerId];
    if (layerInfo) {
      const { layerIndex } = layerInfo;
      const fInvocationMode = makeLayerInvocationModeBits(op.invocationMode);
      return [(fAssignType << 6) | layerIndex, fInvocationMode << 4];
    }
  }
  if (op?.type === 'layerClearExclusive') {
    const fAssingType = 0b11;
    const targetGroup = op.targetExclusionGroup;
    return [(fAssingType << 6) | targetGroup];
  }
  return [0, 0];
}

/*
rawAssignEntryHeader
0b1TTT_LLLL
TTT: type
 0: reserved
 1: single
 2: dual
 3: triple
 4: block
 5: transparent
LLLL: layerIndex
*/
function encodeRawAssignEntryHeaderByte(
  type: 'single' | 'dual' | 'triple' | 'block' | 'transparent',
  layerIndex: number
): number {
  const assignType = {
    single: 1,
    dual: 2,
    triple: 3,
    block: 4,
    transparent: 5
  }[type];
  return (1 << 7) | (assignType << 4) | layerIndex;
}

/*
rawAssignEntry
0x~ HH, for block and transparent assign entry
0x~ HH PP PP, for single assign entry
0x~ HH PP PP SS SS, for dual assign entry
0x~ HH PP PP SS SS TT TT, for triple assign entry
HH: assign entry header
PP: primary operation
SS: secondary oepration
TT: tertiary operation
*/
function encodeRawAssignEntry(ra: IRawAssignEntry): number[] {
  const { entry } = ra;

  const layer = localContext.layersDict[ra.layerId];

  if (entry.type === 'block') {
    return [encodeRawAssignEntryHeaderByte('block', ra.layerIndex)];
  } else if (entry.type === 'transparent') {
    return [encodeRawAssignEntryHeaderByte('transparent', ra.layerIndex)];
  } else if (entry.type === 'single') {
    // single
    return [
      encodeRawAssignEntryHeaderByte('single', ra.layerIndex),
      ...encodeAssignOperation(entry.op, layer)
    ];
  } else {
    // dual
    if (entry.tertiaryOp) {
      return [
        encodeRawAssignEntryHeaderByte('triple', ra.layerIndex),
        ...encodeAssignOperation(entry.primaryOp, layer),
        ...encodeAssignOperation(entry.secondaryOp, layer),
        ...encodeAssignOperation(entry.tertiaryOp, layer)
      ];
    } else if (entry.secondaryOp) {
      return [
        encodeRawAssignEntryHeaderByte('dual', ra.layerIndex),
        ...encodeAssignOperation(entry.primaryOp, layer),
        ...encodeAssignOperation(entry.secondaryOp, layer)
      ];
    } else {
      return [
        encodeRawAssignEntryHeaderByte('single', ra.layerIndex),
        ...encodeAssignOperation(entry.primaryOp, layer)
      ];
    }
  }
}

/*
0b1KKK_KKKK 0bRRRS_SSSS
KKK_KKKK: keyIndex
RRR: reserved
S_SSSS: body length
*/
function encodeKeyBoundAssignsSetHeder(
  keyIndex: number,
  bodyLength: number
): number[] {
  return [(1 << 7) | keyIndex, bodyLength];
}

/*
0x~ HH HH VV VV ...
HH HH: header bytes
VV VV ...: body bytes, variable length
*/
function encodeKeyBoundAssignsSet(assigns: IRawAssignEntry[]): number[] {
  const { keyIndex } = assigns[0];
  const bodyBytes = [...flattenArray(assigns.map(encodeRawAssignEntry))];
  const headBytes = encodeKeyBoundAssignsSetHeder(keyIndex, bodyBytes.length);
  return [...headBytes, ...bodyBytes];
}

function makeRawAssignEntries(profile: IProfileData): IRawAssignEntry[] {
  const {
    assigns,
    layers,
    keyboardShape: { keyUnits }
  } = profile;

  return Object.keys(assigns)
    .map((key) => {
      const [layerId, keyId] = key.split('.');
      const layerIndex = layers.findIndex((la) => la.layerId === layerId);
      const keyUnit = keyUnits.find((ku) => ku.id === keyId);
      const keyIndex = keyUnit ? keyUnit.keyIndex : -1;
      const entry = assigns[key];
      if (layerIndex !== -1 && keyIndex !== -1 && entry) {
        return {
          keyId,
          keyIndex,
          layerId,
          layerIndex,
          entry
        };
      }
      return undefined!;
    })
    .filter((ra) => !!ra);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function hexBytes(bytes: number[], splitter = ',') {
  return bytes.map((b) => ('00' + b.toString(16)).slice(-2)).join(splitter);
}

function fixAssignOperation(
  op: IAssignOperation,
  layout: IKeyboardLayoutStandard
) {
  if (op.type === 'keyInput') {
    const vk = op.virtualKey;
    let mods = op.attachedModifiers;

    const isMacOS = true;
    if (isMacOS) {
      // MACでJIS配列の場合,バックスラッシュをAlt+¥に置き換える
      if (layout === 'JIS' && vk === 'K_BackSlash') {
        if (!mods) {
          mods = ['K_Alt'];
        }
        if (mods && !mods.includes('K_Alt')) {
          mods.push('K_Alt');
        }
        op.virtualKey = 'K_Yen';
        op.attachedModifiers = mods;
      }
    }
  }
}

function fixProfileData(
  profile: IProfileData,
  layout: IKeyboardLayoutStandard
) {
  for (const key in profile.assigns) {
    const assign = profile.assigns[key];
    if (assign) {
      if (assign.type === 'single' && assign.op) {
        fixAssignOperation(assign.op, layout);
      }
      if (assign.type === 'dual') {
        if (assign.primaryOp) {
          fixAssignOperation(assign.primaryOp, layout);
        }
        if (assign.secondaryOp) {
          fixAssignOperation(assign.secondaryOp, layout);
        }
        if (assign.tertiaryOp) {
          fixAssignOperation(assign.tertiaryOp, layout);
        }
      }
    }
  }
}

// LayerAttributeByte
// 0bDxIx_MMMM 0bxxxx_xQQQ
// D: default scheme, 0 for transparent, 1 for block
// I: initialActive
// MMMM: attachedModifiers
// QQQ: exclusion group, 0~7
function makeLayerAttributeBytes(profile: IProfileData): number[] {
  return flattenArray(
    profile.layers.map((la) => {
      const fDefaultScheme = la.defaultScheme === 'block' ? 1 : 0;
      const fInitialActive = la.initialActive ? 1 : 0;
      const fAttachedModifiers = makeAttachedModifiersBits(
        la.attachedModifiers
      );
      return [
        (fDefaultScheme << 7) | (fInitialActive << 5) | fAttachedModifiers,
        la.exclusionGroup
      ];
    })
  );
}

// デバイスのEEPROMに書き込むキーアサインバイナリデータを生成する
// [0:1]: numLayers
// [1:1+numLayers]: layer attributes
// [1+numLayers:~] key assings data
export function converProfileDataToBlobBytes(
  profile0: IProfileData,
  layoutStandard: IKeyboardLayoutStandard
): number[] {
  const profile = duplicateObjectByJsonStringifyParse(profile0);
  fixProfileData(profile, layoutStandard);

  localContext.layoutStandard = layoutStandard;
  localContext.layersDict = createDictionaryFromKeyValues(
    profile.layers.map((la, idx) => [
      la.layerId,
      {
        layerIndex: idx,
        isShiftLayer: la.attachedModifiers?.includes('K_Shift') || false
      }
    ])
  );
  localContext.useShiftCancel = profile.settings.useShiftCancel;

  const layerAttributeBytes = makeLayerAttributeBytes(profile);

  const rawAssigns = makeRawAssignEntries(profile);
  const numLayers = profile.layers.length;
  rawAssigns.sort(
    sortOrderBy((ra) => ra.keyIndex * 100 + (numLayers - ra.layerIndex))
  );

  // console.log(rawAssigns);

  const groupedAssignBytes = createGroupedArrayByKey(
    rawAssigns,
    'keyIndex'
  ).map(encodeKeyBoundAssignsSet);

  // console.log(groupedAssignBytes.map((a) => hexBytes(a, ' ')));

  const keyAssignsBufferBytes = flattenArray(groupedAssignBytes);

  const buf = [numLayers, ...layerAttributeBytes, ...keyAssignsBufferBytes];

  // console.log(`len: ${buf.length}`);

  // console.log(hexBytes(buf));

  return buf;
}
