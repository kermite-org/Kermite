import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { Arrays } from '~funcs/Arrays';
import {
  IKeyStrokeAssignEvent,
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
    outputMinimumDownEventInterval: 50,
    outputMinimumStrokeDuration: 50
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
    return readOutputQueueOne();
  }
}

export namespace KeyBindUpdator {
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

namespace StrokeSequenceEmitter {
  let fakeStrokeIndex = 0;

  export function emitFakeStrokes(vks: VirtualKey[]) {
    const fsIndex = fakeStrokeIndex++;
    vks.forEach((vk, idx) => {
      const keyId = `FS${fsIndex}_${idx}`;
      KeyBindUpdator.pushHoldKeyBind(keyId, vk);
      KeyBindUpdator.removeHoldKeyBind(keyId);
    });
  }

  export async function emitImmediateDownUp(vk: VirtualKey) {
    const keyId = `IDU${fakeStrokeIndex++} ${vk}`;
    KeyBindUpdator.pushHoldKeyBind(keyId, vk);
    KeyBindUpdator.removeHoldKeyBind(keyId);
  }
}

export namespace KeyStrokeAssignGate {
  function isShiftLayer(targetLayerId: string) {
    const layer = logicSimulatorStateC.editModel.layers.find(
      (la) => la.layerId === targetLayerId
    );
    return layer?.isShiftLayer;
  }

  const fixedTextPattern: { [vk in VirtualKey]?: VirtualKey[] } = {
    K_NN: ['K_N', 'K_NONE', 'K_N'],
    K_LTU: ['K_L', 'K_T', 'K_U'],
    K_UU: ['K_U', 'K_U']
  };

  let nextDoubleReserved: boolean = false;

  export function handleLogicalStroke(ev: IKeyStrokeAssignEvent) {
    const { keyBindingInfoDict } = logicSimulatorStateC;
    if (ev.type === 'down') {
      const { keyId, assign } = ev;
      // eslint-disable-next-line no-console
      console.log('down', ev.keyId, assign);

      if (assign.type === 'keyInput') {
        const vk = assign.virtualKey;

        if (vk === 'K_NextDouble') {
          nextDoubleReserved = true;
          return;
        }
        if (fixedTextPattern[vk]) {
          StrokeSequenceEmitter.emitFakeStrokes(fixedTextPattern[vk]!);
          return;
        }

        if (logicSimulatorCConfig.useImmediateDownUp) {
          StrokeSequenceEmitter.emitImmediateDownUp(assign.virtualKey);
          return;
        }
      }

      if (assign.type === 'keyInput') {
        if (nextDoubleReserved) {
          StrokeSequenceEmitter.emitFakeStrokes([assign.virtualKey, 'K_NONE']);
        }
        KeyBindUpdator.pushHoldKeyBind(
          keyId,
          assign.virtualKey,
          assign.attachedModifiers
        );
      } else if (assign.type === 'layerCall') {
        if (isShiftLayer(assign.targetLayerId)) {
          KeyBindUpdator.pushHoldKeyBind(keyId, 'K_Shift');
        }
      }
      nextDoubleReserved = false;
      keyBindingInfoDict[keyId] = { assign, timeStamp: Date.now() };
    } else {
      const { keyId } = ev;
      KeyBindUpdator.removeHoldKeyBind(keyId);
      delete keyBindingInfoDict[keyId];
    }
  }
}
