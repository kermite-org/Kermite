import { ModifierVirtualKey, VirtualKey } from './types/virtualKeys';

const modifierVirtualKeys: ModifierVirtualKey[] = [
  'K_Ctrl',
  'K_Shift',
  'K_Alt',
  'K_Gui',
];

export function isModifierVirtualKey(vk: VirtualKey): vk is ModifierVirtualKey {
  return modifierVirtualKeys.includes(vk as ModifierVirtualKey);
}
