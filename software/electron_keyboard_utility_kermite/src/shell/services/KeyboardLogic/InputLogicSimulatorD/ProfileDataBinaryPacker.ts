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
  defaultScheme: 'block' | 'transparent';
}

const localContext = new (class {
  layoutStandard: IKeyboardLayoutStandard = 'US';
  layersDict: { [layerId: string]: IRawLayerInfo } = {};
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
    exclusive: 7,
    clearExclusive: 8
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
 8: clearExclusive
*/
function encodeAssignOperation(
  op: IAssignOperation | undefined,
  layer: IRawLayerInfo
): number[] {
  if (op?.type === 'keyInput') {
    const tt = 0b01;
    const vk = op.virtualKey;
    if (isModifierVirtualKey(vk)) {
      const mods = makeAttachedModifiersBits([vk]);
      return [(tt << 6) | (mods << 2), 0];
    } else {
      const layoutStandard = localContext.layoutStandard;
      const mods = makeAttachedModifiersBits(op.attachedModifiers);
      let hidKey = getHidKeyCodeEx(vk, layoutStandard);
      if (!layer.isShiftLayer) {
        // shiftレイヤ上のアサインのみshift cancelが効くようにする
        hidKey = hidKey & 0x1ff;
      }
      return [(tt << 6) | (mods << 2) | ((hidKey >> 8) & 0x03), hidKey];
    }
  }
  if (op?.type === 'layerCall') {
    const tt = 0b10;
    const layerInfo = localContext.layersDict[op.targetLayerId];
    if (layerInfo) {
      const { layerIndex } = layerInfo;
      const fInvocationMode = makeLayerInvocationModeBits(op.invocationMode);
      return [(tt << 6) | layerIndex, fInvocationMode << 4];
    }
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

// function hexBytes(bytes: number[]) {
//   return bytes.map((b) => `00${b.toString(16)}`.slice(-2)).join(' ');
// }

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
// 0bDSxx_xxxx
// D: default scheme, 0 for transparent, 1 for block
// S: isShiftLayer
function makeLayerAttributeBytes(profile: IProfileData): number[] {
  return profile.layers.map((la) => {
    const fShift = la.isShiftLayer ? 1 : 0;
    const fDefaultScheme = la.defaultScheme === 'block' ? 1 : 0;
    return (fDefaultScheme << 7) | (fShift << 6);
  });
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
        isShiftLayer: la.isShiftLayer || false,
        defaultScheme: la.defaultScheme
      }
    ])
  );

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

  // console.log(groupedAssignBytes.map(hexBytes));

  const keyAssignsBufferBytes = flattenArray(groupedAssignBytes);

  const buf = [numLayers, ...layerAttributeBytes, ...keyAssignsBufferBytes];

  // console.log(`len: ${buf.length}`);

  return buf;
}
