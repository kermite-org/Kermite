import { ModifierVirtualKey } from '../domain-base';

export function encodeSingleModifierVirtualKey(
  modifier: ModifierVirtualKey,
): number {
  return {
    K_Ctrl: 1,
    K_Shift: 2,
    K_Alt: 4,
    K_Gui: 8,
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
      m === 'K_Ctrl' && (bits |= 1);
      m === 'K_Shift' && (bits |= 2);
      m === 'K_Alt' && (bits |= 4);
      m === 'K_Gui' && (bits |= 8);
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
    mGui && 'K_Gui',
  ].filter((a) => !!a) as ModifierVirtualKey[];
}
