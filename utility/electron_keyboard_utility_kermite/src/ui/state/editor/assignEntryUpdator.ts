import { IKeyAssignEntry } from '~contract/data';
import {
  addOptionToOptionsArray,
  removeOptionFromOptionsArray
} from '~funcs/Utils';
import { ModifierVirtualKey, VirtualKey } from '~model/HighLevelDefs';

export function assignEntryUpdator(
  assign: IKeyAssignEntry | undefined,
  cmd: {
    removeKeyAssign?: boolean;
    setVirtualKey?: VirtualKey;
    addModifier?: ModifierVirtualKey;
    removeModifier?: ModifierVirtualKey;
    setHoldLayer?: string;
  }
): IKeyAssignEntry | undefined {
  if (cmd.removeKeyAssign) {
    return undefined;
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
    return { type: 'holdLayer', targetLayerId, layerInvocationMode: 'hold' };
  }
  return assign;
}
