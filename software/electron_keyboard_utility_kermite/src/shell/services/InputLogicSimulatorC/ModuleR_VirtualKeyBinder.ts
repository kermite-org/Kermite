import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { Arrays } from '~funcs/Arrays';
import {
  ModuleT_OutputKeyStateCombiner,
  IHoldKeySet
} from './ModuleT_OutputKeyStateCombiner';

export namespace ModuleR_VirtualKeyBinder {
  const local = new (class {
    holdKeySets: IHoldKeySet[] = [];
  })();

  export function pushVirtualKey(
    virtualKey: VirtualKey,
    attachedModifiers: ModifierVirtualKey[] = []
  ) {
    const { holdKeySets } = local;
    holdKeySets.push({
      virtualKey,
      attachedModifiers
    });
    ModuleT_OutputKeyStateCombiner.updateOutputReport(holdKeySets);
  }

  export function removeVirtualKey(virtualKey: VirtualKey) {
    const { holdKeySets } = local;
    const removed = Arrays.removeIf(
      holdKeySets,
      (hk) => hk.virtualKey === virtualKey
    );
    if (removed) {
      ModuleT_OutputKeyStateCombiner.updateOutputReport(holdKeySets);
    }
  }
}
