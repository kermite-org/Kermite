import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { Arrays } from '~funcs/Arrays';
import {
  logicSimulatorCConfig,
  logicSimulatorStateC
} from './LogicSimulatorCCommon';
import { ModuleP_OutputKeyStateCombiner } from './ModuleP_OutputKeyStateCombiner';

export type IKeyBindingEvent =
  | {
      type: 'down';
      keyId: string;
      virtualKey: VirtualKey;
      attachedModifiers: ModifierVirtualKey[];
    }
  | {
      type: 'up';
      keyId: string;
    };

export namespace KeyBindingEventTimingAligner {
  const local = new (class {
    outputQueue: IKeyBindingEvent[] = [];
    prevDownOutputTick: number = 0;
    outputDownTickMap: { [keyId: string]: number } = {};
    upEventsDict: { [keyId: string]: IKeyBindingEvent } = {};
  })();

  export function pushKeyBindingEvent(ev: IKeyBindingEvent) {
    if (ev.type === 'down') {
      local.outputQueue.push(ev);
    } else {
      local.upEventsDict[ev.keyId] = ev;
    }
  }

  const cfg = {
    outputMinimumDownEventInterval: 70,
    outputMinimumStrokeDuration: 70
  };

  function readOutputQueueOne() {
    const { outputQueue } = local;
    const curTick = Date.now();

    if (outputQueue.length > 0) {
      const ev = outputQueue[0];
      if (
        curTick >
        local.prevDownOutputTick + cfg.outputMinimumDownEventInterval
      ) {
        local.prevDownOutputTick = curTick;
        local.outputDownTickMap[ev.keyId] = curTick;
        outputQueue.shift();
        return ev;
      }
    }

    for (const keyId in local.upEventsDict) {
      const ev = local.upEventsDict[keyId];
      const downTick = local.outputDownTickMap[keyId];
      if (downTick && curTick > downTick + cfg.outputMinimumStrokeDuration) {
        delete local.outputDownTickMap[keyId];
        delete local.upEventsDict[keyId];
        return ev;
      }
    }

    return undefined;
  }

  export function readQueuedEventOne(): IKeyBindingEvent | undefined {
    const ev = readOutputQueueOne();
    return ev;
  }
}

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
