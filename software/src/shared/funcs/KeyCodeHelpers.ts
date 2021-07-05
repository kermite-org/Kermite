import { ModifierVirtualKey } from '~/shared/defs';

export function encodeSingleModifierVirtualKey(
  modifier: ModifierVirtualKey,
): number {
  return {
    K_Ctrl: 1,
    K_Shift: 2,
    K_Alt: 3,
    K_Gui: 4,
  }[modifier];
}

export function decodeSingleModifierVirtualKey(
  modifierFlag: number,
): ModifierVirtualKey {
  return [
    'K_Ctrl' as const,
    'K_Shift' as const,
    'K_Alt' as const,
    'K_Gui' as const,
  ][modifierFlag];
}

export function encodeModifierVirtualKeys(
  attachedModifiers: ModifierVirtualKey[],
): number {
  let bits = 0;
  if (attachedModifiers) {
    for (const m of attachedModifiers) {
      m === 'K_Ctrl' && (bits |= 0x01);
      m === 'K_Shift' && (bits |= 0x02);
      m === 'K_Alt' && (bits |= 0x04);
      m === 'K_Gui' && (bits |= 0x08);
    }
  }
  return bits;
}

export function decodeModifierVirtualKeys(bits: number): ModifierVirtualKey[] {
  const mCtlr = (bits & 1) > 0;
  const mShift = (bits & 2) > 0;
  const mAlt = (bits & 4) > 0;
  const mGui = (bits & 8) > 0;
  return [
    mCtlr && 'K_Ctrl',
    mShift && 'K_Shift',
    mAlt && 'K_Alt',
    mGui && 'K_GUI',
  ].filter((a) => !!a) as ModifierVirtualKey[];
}
