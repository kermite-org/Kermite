import { IKeyAssignEntry } from '~contract/data';
import { ModifierVirtualKey, VirtualKey } from '~model/HighLevelDefs';
import { LogicalKeyAction, TAdhocShift } from './Types';
import { HidKeyCodes } from '~model/HidKeyCodes';

export namespace KeyAssignToLogicalKeyActionResolver {
  function extractVkSet(
    vkSet: number | undefined
  ): { vkCode: number; adhocShift: TAdhocShift } | undefined {
    if (vkSet !== undefined) {
      const vkCode = vkSet & 0xff;
      const adhocShift =
        (vkSet & 0x100) === 0x100
          ? 'down'
          : (vkSet & 0x200) === 0x200
          ? 'up'
          : undefined;
      if (vkCode !== 0) {
        return { vkCode, adhocShift };
      }
    }
    return undefined;
  }

  function getRandomCode() {
    return (
      'c' +
      Math.random()
        .toString()
        .slice(2, 6)
    );
  }

  function createKeyInputLogicalKeyAction(
    virtualKey: VirtualKey,
    modifiers?: ModifierVirtualKey[]
  ): LogicalKeyAction | undefined {
    const vkSet = extractVkSet(HidKeyCodes[virtualKey]);
    if (vkSet) {
      const { vkCode, adhocShift } = vkSet;
      const attachedModifierKeyCodes = modifiers?.map(m => HidKeyCodes[m]);
      return {
        type: 'keyInput',
        stroke: {
          keyCode: vkCode,
          adhocShift,
          attachedModifierKeyCodes
        },
        rcode: getRandomCode()
      };
    }
    return undefined;
  }

  export function mapKeyAssignEntryToLogicalKeyAction(
    assign: IKeyAssignEntry
  ): LogicalKeyAction | undefined {
    if (assign.type === 'keyInput') {
      const { virtualKey, modifiers } = assign;
      return createKeyInputLogicalKeyAction(virtualKey, modifiers);
    } else if (assign.type === 'holdLayer') {
      const { targetLayerId, layerInvocationMode } = assign;
      return {
        type: 'holdLayer',
        targetLayerId,
        layerInvocationMode: layerInvocationMode || 'hold',
        rcode: getRandomCode()
      };
    } else if (assign.type === 'holdModifier') {
      const { modifierKey, isOneShot } = assign;
      const modifierKeyCode = HidKeyCodes[modifierKey];
      return {
        type: 'holdModifier',
        modifierKeyCode,
        isOneShot,
        rcode: getRandomCode()
      };
    }
    return undefined;
  }
}
