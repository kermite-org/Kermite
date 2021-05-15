import { LogicalKey, routerConstants } from '~/shared';
import { dataStorage } from '~/shell/services/keyboardLogic/inputLogicSimulatorD/DataStorage';

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
  KeyCodeSourceValueNone,
  KeyCodeSourceValueAny,
  ModifierSourceValueNone,
  ModifierSourceValueAny,
  KeyCodeDestinationValueStop,
  KeyCodeDestinationValueKeep,
  ModifierDestinationValueKeep,
} = routerConstants;
const local = new (class {
  addrItems: number = 0;
  numItems: number = 0;
})();

export function keyActionRemapper_setupDataReader() {
  const addrMappingEntriesBlock = dataStorage.getChunk_mpaaingEntreis().address;
  if (addrMappingEntriesBlock) {
    local.numItems = dataStorage.readByte(addrMappingEntriesBlock);
    local.addrItems = addrMappingEntriesBlock + 1;
  }
}

export function keyActionRemapper_translateKeyOperation(
  opWord: u16,
  wiringMode: u8,
): u16 {
  let logicalKey = opWord & 0x7f;
  let modifiers = (opWord >> 8) & 0b1111;

  for (let i = 0; i < local.numItems; i++) {
    const addrItem = local.addrItems + i * 5;
    const ch = dataStorage.readByte(addrItem + 0);
    if (ch === wiringMode) {
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
        (logicalKey === srcKeyCode || logicalKey === KeyCodeSourceValueAny) &&
        (modifiers === srcModifiers || modifiers === ModifierSourceValueAny)
      ) {
        const dstKeyCode = dataStorage.readByte(addrItem + 3);
        const dstModifiers = dataStorage.readByte(addrItem + 4);

        if (dstKeyCode === KeyCodeDestinationValueStop) {
          logicalKey = LogicalKey.LK_NONE;
          modifiers = 0;
        } else {
          if (dstKeyCode !== KeyCodeDestinationValueKeep) {
            logicalKey = dstKeyCode;
          }
          if (dstModifiers !== ModifierDestinationValueKeep) {
            modifiers = dstModifiers;
          }
        }
        break;
      }
    }
  }

  return (modifiers << 8) | logicalKey;
}
