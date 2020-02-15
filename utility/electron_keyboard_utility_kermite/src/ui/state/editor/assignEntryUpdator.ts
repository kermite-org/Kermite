import { IKeyAssignEntry } from '~contract/data';
import {
  addOptionToOptionsArray,
  removeOptionFromOptionsArray
} from '~funcs/Utils';
import { ModifierVirtualKeys, VirtualKey } from '~model/HighLevelDefs';

export function assignEntryUpdator(
  assign: IKeyAssignEntry | undefined,
  cmd: {
    removeKeyAssign?: boolean;
    setVirtualKey?: VirtualKey;
    addModifier?: ModifierVirtualKeys;
    removeModifier?: ModifierVirtualKeys;
    setHoldLayer?: string;
  }
): IKeyAssignEntry | undefined {
  if (cmd.removeKeyAssign) {
    if (assign && assign.type === 'keyInput') {
      return { ...assign, virtualKey: 'K_NONE' };
    } else {
      return undefined;
    }
  }
  if (cmd.setVirtualKey) {
    const virtualKey = cmd.setVirtualKey;
    if (assign && assign.type === 'keyInput') {
      return { ...assign, virtualKey };
    } else {
      return { type: 'keyInput', virtualKey };
    }
  }
  if (cmd.addModifier) {
    const modifierKey = cmd.addModifier;
    if (assign && assign.type === 'keyInput') {
      const modifiers = addOptionToOptionsArray(assign.modifiers, modifierKey);
      return { ...assign, modifiers };
    } else {
      return {
        type: 'keyInput',
        virtualKey: 'K_NONE',
        modifiers: [modifierKey]
      };
    }
  }
  if (cmd.removeModifier) {
    const modifierKey = cmd.removeModifier;
    if (assign && assign.type === 'keyInput') {
      const modifiers = removeOptionFromOptionsArray(
        assign.modifiers,
        modifierKey
      );
      return { ...assign, modifiers };
    } else {
      return assign;
    }
  }
  if (cmd.setHoldLayer) {
    const targetLayerId = cmd.setHoldLayer;
    return { type: 'holdLayer', targetLayerId };
  }
  return assign;
}
