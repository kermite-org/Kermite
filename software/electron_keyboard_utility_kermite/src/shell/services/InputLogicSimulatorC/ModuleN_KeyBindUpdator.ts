import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { Arrays } from '~funcs/Arrays';
import {
  logicSimulatorCConfig,
  logicSimulatorStateC
} from './LogicSimulatorCCommon';
import { ModuleP_OutputKeyStateCombiner } from './ModuleP_OutputKeyStateCombiner';
import { KeyBindingEventTimingAligner } from './ModuleN_KeyBindUpdator_Aligner';

export namespace ModuleN_KeyBindUpdator {
  export function pushHoldKeyBindInternal(
    keyId: string,
    virtualKey: VirtualKey,
    attachedModifiers: ModifierVirtualKey[] = []
  ) {
    logicSimulatorStateC.holdKeyBinds.push({
      keyId,
      virtualKey,
      attachedModifiers
    });
    ModuleP_OutputKeyStateCombiner.updateOutputReport();
  }

  export function removeHoldKeyBindInternal(keyId: string) {
    const { holdKeyBinds } = logicSimulatorStateC;
    const target = holdKeyBinds.find((hk) => hk.keyId === keyId);
    if (target) {
      Arrays.remove(holdKeyBinds, target);
      ModuleP_OutputKeyStateCombiner.updateOutputReport();
    }
  }

  export function pushHoldKeyBind(
    keyId: string,
    virtualKey: VirtualKey,
    attachedModifiers: ModifierVirtualKey[] = []
  ) {
    if (!logicSimulatorCConfig.useKeyBindEventAligner) {
      pushHoldKeyBindInternal(keyId, virtualKey, attachedModifiers);
      return;
    }
    KeyBindingEventTimingAligner.pushKeyBindingEvent({
      type: 'down',
      keyId,
      virtualKey,
      attachedModifiers
    });
  }

  export function removeHoldKeyBind(keyId: string) {
    if (!logicSimulatorCConfig.useKeyBindEventAligner) {
      removeHoldKeyBindInternal(keyId);
      return;
    }
    KeyBindingEventTimingAligner.pushKeyBindingEvent({ type: 'up', keyId });
  }

  export function processUpdate() {
    const ev = KeyBindingEventTimingAligner.readQueuedEventOne();
    if (ev) {
      if (ev.type === 'down') {
        pushHoldKeyBindInternal(ev.keyId, ev.virtualKey, ev.attachedModifiers);
      } else {
        removeHoldKeyBindInternal(ev.keyId);
      }
    }
  }
}
