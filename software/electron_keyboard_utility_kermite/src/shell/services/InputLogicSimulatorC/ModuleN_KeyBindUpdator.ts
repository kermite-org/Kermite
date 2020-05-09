import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { Arrays } from '~funcs/Arrays';
import {
  logicSimulatorCConfig,
  logicSimulatorStateC
} from './LogicSimulatorCCommon';
import { ModuleP_OutputKeyStateCombiner } from './ModuleP_OutputKeyStateCombiner';
import { KeyBindingEventTimingAligner } from './ModuleN_KeyBindUpdatorAligner';

export namespace ModuleN_KeyBindUpdator {
  export function pushHoldKeyBindInternal(
    virtualKey: VirtualKey,
    attachedModifiers: ModifierVirtualKey[] = []
  ) {
    logicSimulatorStateC.holdKeyBinds.push({
      virtualKey,
      attachedModifiers
    });
    ModuleP_OutputKeyStateCombiner.updateOutputReport();
  }

  export function removeHoldKeyBindInternal(virtualKey: VirtualKey) {
    const { holdKeyBinds } = logicSimulatorStateC;
    const removed = Arrays.removeIf(
      holdKeyBinds,
      (hk) => hk.virtualKey === virtualKey
    );
    if (removed) {
      ModuleP_OutputKeyStateCombiner.updateOutputReport();
    }
  }

  export function pushHoldKeyBind(
    virtualKey: VirtualKey,
    attachedModifiers: ModifierVirtualKey[] = []
  ) {
    KeyBindingEventTimingAligner.pushKeyBindingEvent({
      type: 'down',
      virtualKey,
      attachedModifiers
    });
  }

  export function removeHoldKeyBind(virtualKey: VirtualKey) {
    KeyBindingEventTimingAligner.pushKeyBindingEvent({
      type: 'up',
      virtualKey
    });
  }

  export function processUpdate() {
    const ev = KeyBindingEventTimingAligner.readQueuedEventOne();
    if (ev) {
      if (ev.type === 'down') {
        pushHoldKeyBindInternal(ev.virtualKey, ev.attachedModifiers);
      } else {
        removeHoldKeyBindInternal(ev.virtualKey);
      }
    }
  }
}
