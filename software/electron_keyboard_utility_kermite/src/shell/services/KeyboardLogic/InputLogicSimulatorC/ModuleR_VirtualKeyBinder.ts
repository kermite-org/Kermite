import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import {
  createModuleIo,
  IVirtualKeyEvent,
  IHoldKeySet
} from './LogicSimulatorCCommon';
import { removeArrayItemsMatched } from '~funcs/Utils';

export namespace ModuleR_VirtualKeyBinder {
  export const io = createModuleIo<IVirtualKeyEvent, IHoldKeySet[]>(
    handleInputEvent
  );
  const local = new (class {
    holdKeySets: IHoldKeySet[] = [];
  })();

  function pushVirtualKey(
    virtualKey: VirtualKey,
    attachedModifiers: ModifierVirtualKey[] = []
  ) {
    const { holdKeySets } = local;
    holdKeySets.push({
      virtualKey,
      attachedModifiers
    });
    io.emit(holdKeySets);
  }

  function removeVirtualKey(virtualKey: VirtualKey) {
    const { holdKeySets } = local;
    const removed = removeArrayItemsMatched(
      holdKeySets,
      (hk) => hk.virtualKey === virtualKey
    );
    if (removed) {
      io.emit(holdKeySets);
    }
  }

  function handleInputEvent(ev: IVirtualKeyEvent) {
    if (ev.isDown) {
      pushVirtualKey(ev.virtualKey, ev.attachedModifiers);
    } else {
      removeVirtualKey(ev.virtualKey);
    }
  }
}
