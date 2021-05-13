import { LogicalKey } from '~/shell/services/keyboardLogic/inputLogicSimulatorD/LogicalKey';

type u8 = number;
type u16 = number;

type IActionRemapEntry = {
  wiringMode: u8;
  srcLogicalKey: u8;
  srcModifiers: u8;
  dstLogicalKey: u8;
  dstModifiers: u8;
};

const actionRemapEntries: IActionRemapEntry[] = [
  {
    wiringMode: 0,
    srcLogicalKey: LogicalKey.LK_A,
    srcModifiers: 0,
    dstLogicalKey: LogicalKey.LK_B,
    dstModifiers: 0,
  },
  {
    wiringMode: 0,
    srcLogicalKey: LogicalKey.LK_BackSlash,
    srcModifiers: 0,
    dstLogicalKey: LogicalKey.LK_Yen,
    dstModifiers: 0b0100,
  },
  {
    wiringMode: 0,
    srcLogicalKey: LogicalKey.LK_Muhenkan,
    srcModifiers: 0,
    dstLogicalKey: LogicalKey.LK_Semicolon,
    dstModifiers: 0b0011,
  },
  {
    wiringMode: 0,
    srcLogicalKey: LogicalKey.LK_Henkan,
    srcModifiers: 0,
    dstLogicalKey: LogicalKey.LK_J,
    dstModifiers: 0b0011,
  },
  {
    wiringMode: 1,
    srcLogicalKey: LogicalKey.LK_A,
    srcModifiers: 0,
    dstLogicalKey: LogicalKey.LK_F,
    dstModifiers: 0,
  },
  {
    wiringMode: 1,
    srcLogicalKey: LogicalKey.LK_Ctrl,
    srcModifiers: 0,
    dstLogicalKey: LogicalKey.LK_Gui,
    dstModifiers: 0,
  },
  {
    wiringMode: 1,
    srcLogicalKey: LogicalKey.LK_Gui,
    srcModifiers: 0,
    dstLogicalKey: LogicalKey.LK_Ctrl,
    dstModifiers: 0,
  },
];

export function keyActionRemapper_translateKeyOperation(
  opWord: u16,
  wiringMode: u8,
): u16 {
  let logicalKey = opWord & 0x7f;
  let modifiers = (opWord >> 8) & 0b1111;

  // console.log({ logicalKey, modifiers });

  for (const re of actionRemapEntries) {
    if (
      wiringMode === re.wiringMode &&
      logicalKey === re.srcLogicalKey &&
      modifiers === re.srcModifiers
    ) {
      logicalKey = re.dstLogicalKey;
      modifiers = re.dstModifiers;
      break;
    }
  }
  return (modifiers << 8) | logicalKey;
}
