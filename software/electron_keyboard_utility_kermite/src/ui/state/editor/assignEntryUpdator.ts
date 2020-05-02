import {
  addOptionToOptionsArray,
  removeOptionFromOptionsArray
} from '~funcs/Utils';
import { IKeyAssignEntry } from '~defs/ProfileData';
import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';

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
      const attachedModifiers = addOptionToOptionsArray(
        assign.attachedModifiers,
        modifierKey
      );
      return { ...assign, attachedModifiers };
    } else {
      return {
        type: 'keyInput',
        virtualKey: 'K_NONE',
        attachedModifiers: [modifierKey]
      };
    }
  }
  if (cmd.removeModifier) {
    const modifierKey = cmd.removeModifier;
    if (assign && assign.type === 'keyInput') {
      const attachedModifiers = removeOptionFromOptionsArray(
        assign.attachedModifiers,
        modifierKey
      );
      return { ...assign, attachedModifiers };
    } else {
      return assign;
    }
  }
  if (cmd.setHoldLayer) {
    const targetLayerId = cmd.setHoldLayer;
    return { type: 'layerCall', targetLayerId, invocationMode: 'hold' };
  }
  return assign;
}
