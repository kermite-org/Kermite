import { routerConstants } from '~/shared';
import { dataStorage } from '~/shell/services/keyboardLogic/dataStorage';

type u8 = number;
type u16 = number;

// type IActionRemapEntry = {
//   wiringMode: u8;
//   srcLogicalKey: u8;
//   srcModifiers: u8;
//   dstLogicalKey: u8;
//   dstModifiers: u8;
// };

const {
  RoutingChannelValueAny,
  KeyCodeSourceValueNone,
  KeyCodeSourceValueAny,
  ModifierSourceValueNone,
  ModifierSourceValueAny,
  KeyCodeDestinationValueKeep,
  ModifierDestinationValueKeep,
} = routerConstants;
const local = new (class {
  addrItems: number = 0;
  numItems: number = 0;
})();

export function keyActionRemapper_setupDataReader() {
  const addrMappingEntriesBlock = dataStorage.getChunk_mappingEntries().address;
  if (addrMappingEntriesBlock) {
    local.numItems = dataStorage.readByte(addrMappingEntriesBlock);
    local.addrItems = addrMappingEntriesBlock + 1;
  }
}

export function keyActionRemapper_translateKeyOperation(
  opWord: u16,
  routingChannel: u8,
): u16 {
  const wordBase = opWord & 0xf000;
  let modifiers = (opWord >> 8) & 0x0f;
  let logicalKey = opWord & 0xff;

  for (let i = 0; i < local.numItems; i++) {
    const addrItem = local.addrItems + i * 5;
    const ch = dataStorage.readByte(addrItem + 0);
    if (ch === routingChannel || ch === RoutingChannelValueAny) {
      const srcKeyCode = dataStorage.readByte(addrItem + 1);
      const srcModifiers = dataStorage.readByte(addrItem + 2);
      if (
        (srcKeyCode === KeyCodeSourceValueNone ||
          srcKeyCode === KeyCodeSourceValueAny) &&
        (srcModifiers === ModifierSourceValueNone ||
          srcModifiers === ModifierSourceValueAny)
      ) {
        continue;
      }
      if (
        (logicalKey === srcKeyCode || srcKeyCode === KeyCodeSourceValueAny) &&
        (modifiers === srcModifiers || srcModifiers === ModifierSourceValueAny)
      ) {
        const dstKeyCode = dataStorage.readByte(addrItem + 3);
        const dstModifiers = dataStorage.readByte(addrItem + 4);
        if (dstKeyCode !== KeyCodeDestinationValueKeep) {
          logicalKey = dstKeyCode;
        }
        if (dstModifiers !== ModifierDestinationValueKeep) {
          modifiers = dstModifiers;
        }
        break;
      }
    }
  }

  return wordBase | (modifiers << 8) | logicalKey;
}
