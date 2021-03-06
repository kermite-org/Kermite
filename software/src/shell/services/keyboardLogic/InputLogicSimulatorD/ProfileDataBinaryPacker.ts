import {
  IAssignEntry,
  IKeyboardLayoutStandard,
  ModifierVirtualKey,
  LayerInvocationMode,
  IAssignOperation,
  isModifierVirtualKey,
  getHidKeyCodeEx,
  flattenArray,
  IProfileData,
  duplicateObjectByJsonStringifyParse,
  createDictionaryFromKeyValues,
  sortOrderBy,
  createGroupedArrayByKey,
  ConfigStorageFormatRevision,
} from '~/shared';
import {
  writeUint16BE,
  writeUint8,
} from '~/shell/services/device/KeyboardDevice/Helpers';
import { AssignStorageHeaderLength } from '~/shell/services/keyboardLogic/InputLogicSimulatorD/MemoryDefs';

/*
Key Assigns Restriction
supports max 16 Layers
supports max 255 Keys
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
  attachedModifiers?: ModifierVirtualKey[],
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
    oneshot: 5,
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
 5: oneshot

layerClearExclusive
0bTTxx_xQQQ 0bxxx_xxxx
TT: type, 0b11 for layerClearExclusive
QQQ: target exclusion group
*/
function encodeAssignOperation(
  op: IAssignOperation | undefined,
  layer: IRawLayerInfo,
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
        hidKey,
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
  layerIndex: number,
): number {
  const assignType = {
    single: 1,
    dual: 2,
    triple: 3,
    block: 4,
    transparent: 5,
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
      ...encodeAssignOperation(entry.op, layer),
    ];
  } else {
    // dual
    if (entry.tertiaryOp) {
      return [
        encodeRawAssignEntryHeaderByte('triple', ra.layerIndex),
        ...encodeAssignOperation(entry.primaryOp, layer),
        ...encodeAssignOperation(entry.secondaryOp, layer),
        ...encodeAssignOperation(entry.tertiaryOp, layer),
      ];
    } else if (entry.secondaryOp) {
      return [
        encodeRawAssignEntryHeaderByte('dual', ra.layerIndex),
        ...encodeAssignOperation(entry.primaryOp, layer),
        ...encodeAssignOperation(entry.secondaryOp, layer),
      ];
    } else {
      return [
        encodeRawAssignEntryHeaderByte('single', ra.layerIndex),
        ...encodeAssignOperation(entry.primaryOp, layer),
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
  bodyLength: number,
): number[] {
  if (bodyLength > 63) {
    throw new Error(
      `key bound assign size overrun, keyIndex: ${keyIndex}, bodyLength: ${bodyLength}/63`,
    );
  }
  return [(1 << 7) | bodyLength, keyIndex];
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function hexBytes(bytes: number[], splitter = ',') {
  return bytes.map((b) => ('00' + b.toString(16)).slice(-2)).join(splitter);
}

function fixAssignOperation(
  op: IAssignOperation,
  layout: IKeyboardLayoutStandard,
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
  layout: IKeyboardLayoutStandard,
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
        la.attachedModifiers,
      );
      return [
        (fDefaultScheme << 7) | (fInitialActive << 5) | fAttachedModifiers,
        la.exclusionGroup,
      ];
    }),
  );
}

// デバイスのEEPROMに書き込むキーアサインバイナリデータを生成する
// [0:numLayers*2-1]: layer attributes
// [numLayers*2:~] key assings data
export function converProfileDataToBlobBytes(
  profile0: IProfileData,
  layoutStandard: IKeyboardLayoutStandard,
): number[] {
  const profile = duplicateObjectByJsonStringifyParse(profile0);
  fixProfileData(profile, layoutStandard);

  localContext.layoutStandard = layoutStandard;
  localContext.layersDict = createDictionaryFromKeyValues(
    profile.layers.map((la, idx) => [
      la.layerId,
      {
        layerIndex: idx,
        isShiftLayer: la.attachedModifiers?.includes('K_Shift') || false,
      },
    ]),
  );
  localContext.useShiftCancel = profile.settings.useShiftCancel;

  const layerAttributeBytes = makeLayerAttributeBytes(profile);

  const rawAssigns = makeRawAssignEntries(profile);
  const numLayers = profile.layers.length;
  rawAssigns.sort(
    sortOrderBy((ra) => ra.keyIndex * 100 + (numLayers - ra.layerIndex)),
  );

  // console.log(rawAssigns);

  const groupedAssignBytes = createGroupedArrayByKey(
    rawAssigns,
    'keyIndex',
  ).map(encodeKeyBoundAssignsSet);

  // console.log(groupedAssignBytes.map((a) => hexBytes(a, ' ')));

  const keyAssignsBufferBytes = flattenArray(groupedAssignBytes);

  const buf = [...layerAttributeBytes, ...keyAssignsBufferBytes];

  // console.log(`len: ${buf.length}`);

  // console.log(hexBytes(buf));

  return buf;
}

/*
Data format for the keymapping data stored in AVR's EEPROM
EEPROM 1KB

U=USER_EEPROM_SIZE, EEPROM先頭に確保されたユーザ領域, 未使用の場合は0

[0~7] projectId 8bytes
[8] reserved
[9] isParameterInitialzed flag
[10~19] customSettingBytes 10bytes
[20~] keymappingData
 [20~31] keymapping data header 12bytes
 [32~(1024-U)] keymapping data body

[(1024-U)~1023] user eeprom data

keymapping Header 12bytes
[0~1] 0xFE03(BE), magic number
[2~3] 0xFFFF(BE), reserved
[4] logic model type
  0x01 for dominant
[5] format revision, increment when format changed
[6] bodyOffset, 12
[7] numKeys
[8] numLayers
[9~10] bodyLength
[11]: padding
*/
function encodeHeaderBytes(
  numKeys: number,
  numLayers: number,
  bodyLength: number,
): number[] {
  const headerLength = AssignStorageHeaderLength;
  const buffer = Array(headerLength).fill(0);
  writeUint16BE(buffer, 0, 0xfe03);
  writeUint16BE(buffer, 2, 0xffff);
  writeUint8(buffer, 4, 0x01);
  writeUint8(buffer, 5, ConfigStorageFormatRevision);
  writeUint8(buffer, 6, headerLength);
  writeUint8(buffer, 7, numKeys);
  writeUint8(buffer, 8, numLayers);
  writeUint16BE(buffer, 9, bodyLength);
  return buffer;
}

export function makeKeyAssignsConfigStorageData(
  profileData: IProfileData,
  layout: IKeyboardLayoutStandard,
): number[] {
  const keyNum = profileData.keyboardDesign.keyEntities.length;
  const layerNum = profileData.layers.length;
  const assignsDataBytes = converProfileDataToBlobBytes(profileData, layout);
  const headerBytes = encodeHeaderBytes(
    keyNum,
    layerNum,
    assignsDataBytes.length,
  );
  return [...headerBytes, ...assignsDataBytes];
}
