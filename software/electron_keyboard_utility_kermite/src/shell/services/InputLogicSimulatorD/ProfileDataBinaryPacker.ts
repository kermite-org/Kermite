import {
  IProfileData,
  IAssignEntry,
  IAssignOperation
} from '~defs/ProfileData';
import { createDictionaryFromKeyValues, sortOrderBy } from '~funcs/Utils';
import { ModifierVirtualKey } from '~defs/VirtualKeys';
import { Arrays } from '~funcs/Arrays';

/*
Key Layout Restriction
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

type IIdToIndexMap = { [id: string]: number };

const localContext = new (class {
  layerIdToLayerIndexMap: IIdToIndexMap = {};
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

/*
noOperation
0bTTXX_XXXX 0bXXXX_XXXX
TT: type, 0b00 for noOperation

keyInput
0bTTRR_MMMM 0bKKKK_KKKK
TT: type, 0b01 for keyInput
RR: reserved
MMMM: modifiers, [os, alt, shift, ctrl] for msb-lsb
KKKK_KKKK: LogicalKey

layerCall
0bTTRR_LLLL 0bXXXX_XXXX
TT: type, 0b10 for layerCall
RR: reserved
LLLL: layerIndex
*/
function encodeAssignOperation(op: IAssignOperation | undefined): number[] {
  if (op?.type === 'keyInput') {
    const tt = 0b01;
    const mods = makeAttachedModifiersBits(op.attachedModifiers);
    const key = -1; //TODO VirtualKeyToLogicalKey[op.virtualKey] || 0
    return [(tt << 6) | mods, key];
  } else if (op?.type === 'layerCall') {
    const tt = 0b10;
    const layerIndex = localContext.layerIdToLayerIndexMap[op.targetLayerId];
    return [(tt << 6) | layerIndex];
  }
  return [0, 0];
}

/*
rawAssignEntryHeader
0b1RTT_LLLL
R: reserved
TT: type
 0b00: reserved
 0b01: single
 0b10: dual
 0b11: reserved
LLLL: layerIndex
*/
function encodeRawAssignEntryHeaderByte(
  type: 'single' | 'dual',
  layerIndex: number
): number {
  const tt = type === 'single' ? 0b01 : 0b10;
  return (1 << 7) | (tt << 4) | layerIndex;
}

/*
rawAssignEntry
0x~ HH PP PP, for single assign entry
0x~ HH PP PP SS SS, for dual assign entry
HH: assign entry header
PP: primary operation
SS: secondary oepration
*/
function encodeRawAssignEntry(ra: IRawAssignEntry): number[] {
  const { entry } = ra;
  if (entry.type === 'single') {
    return [
      encodeRawAssignEntryHeaderByte('single', ra.layerIndex),
      ...encodeAssignOperation(entry.op)
    ];
  } else {
    if (!entry.secondaryOp) {
      return [
        encodeRawAssignEntryHeaderByte('single', ra.layerIndex),
        ...encodeAssignOperation(entry.primaryOp)
      ];
    } else {
      return [
        encodeRawAssignEntryHeaderByte('dual', ra.layerIndex),
        ...encodeAssignOperation(entry.primaryOp),
        ...encodeAssignOperation(entry.secondaryOp)
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
function encodeKeyBounAssignsSetHeder(
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
function encodeKeyBounAssignsSet(assigns: IRawAssignEntry[]): number[] {
  const { keyIndex } = assigns[0];
  const bodyBytes = [...Arrays.flatten(assigns.map(encodeRawAssignEntry))];
  const headBytes = encodeKeyBounAssignsSetHeder(keyIndex, bodyBytes.length);
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

function hexBytes(bytes: number[]) {
  return bytes.map((b) => `00${b.toString(16)}`.slice(-2)).join(' ');
}

export function converProfileDataToBlobBytes(profile: IProfileData): number[] {
  localContext.layerIdToLayerIndexMap = createDictionaryFromKeyValues(
    profile.layers.map((la, idx) => [la.layerId, idx])
  );

  const rawAssigns = makeRawAssignEntries(profile);
  const numLayers = profile.layers.length;
  rawAssigns.sort(
    sortOrderBy((ra) => ra.keyIndex * 100 + (numLayers - ra.layerIndex))
  );

  // console.log(rawAssigns);

  const groupedAssignBytes = Arrays.groupBy(rawAssigns, 'keyIndex').map(
    encodeKeyBounAssignsSet
  );

  console.log(groupedAssignBytes.map(hexBytes));

  const keyAssignsBufferBytes = Arrays.flatten(groupedAssignBytes);
  const buf = [...keyAssignsBufferBytes];

  console.log(`len: ${buf.length}`);
  // console.log(buf);

  if (buf.length >= 1024) {
    //too bad
  }

  return buf;
}

//todo: viertual key to logical key
