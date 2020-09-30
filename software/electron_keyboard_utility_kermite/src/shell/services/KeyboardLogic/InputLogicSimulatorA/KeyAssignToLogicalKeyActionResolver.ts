import { LogicalKeyAction, TAdhocShift } from './Types';
import { HidKeyCodes, getHidKeyCodeEx } from '~defs/HidKeyCodes';
import { VirtualKey, ModifierVirtualKey } from '~defs/VirtualKeys';
import { IAssignOperation } from '~defs/ProfileData';

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
    return 'c' + Math.random().toString().slice(2, 6);
  }

  function createKeyInputLogicalKeyAction(
    virtualKey: VirtualKey,
    modifiers?: ModifierVirtualKey[]
  ): LogicalKeyAction | undefined {
    const vkSet = extractVkSet(getHidKeyCodeEx(virtualKey, 'JIS'));
    if (vkSet) {
      const { vkCode, adhocShift } = vkSet;
      const attachedModifierKeyCodes = modifiers?.map((m) => HidKeyCodes[m]);
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

  export function mapAssignOperationToLogicalKeyAction(
    op: IAssignOperation
  ): LogicalKeyAction | undefined {
    if (op.type === 'keyInput') {
      const { virtualKey, attachedModifiers } = op;
      return createKeyInputLogicalKeyAction(virtualKey, attachedModifiers);
    } else if (op.type === 'layerCall') {
      const { targetLayerId, invocationMode } = op;
      return {
        type: 'holdLayer',
        targetLayerId,
        layerInvocationMode: invocationMode || 'hold',
        rcode: getRandomCode()
      };
    } else if (op.type === 'modifierCall') {
      const { modifierKey, isOneShot } = op;
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