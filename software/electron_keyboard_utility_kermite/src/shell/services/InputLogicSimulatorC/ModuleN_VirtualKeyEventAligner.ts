import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { Arrays } from '~funcs/Arrays';
import { ModuleR_VirtualKeyBinder } from './ModuleR_VirtualKeyBinder';

export type IVirtualKeyEvent =
  | {
      type: 'down';
      virtualKey: VirtualKey;
      attachedModifiers: ModifierVirtualKey[];
    }
  | {
      type: 'up';
      virtualKey: VirtualKey;
    };

interface IVirtualKeyStroke {
  virtualKey: VirtualKey;
  attachedModifiers: ModifierVirtualKey[];
  outDownTick: number;
  canRelease: boolean;
}

const cfg = {
  // outputMinimumDownEventInterval: 70,
  // outputMinimumStrokeDuration: 70,
  // outputMinimumStrokeIntervalBetweenSameKeyId: 40
  outputMinimumDownEventInterval: 10,
  outputMinimumStrokeDuration: 10,
  outputMinimumStrokeIntervalBetweenSameKeyId: 10
};

export namespace ModuleN_VirtualKeyEventAligner {
  const local = new (class {
    inputQueue: IVirtualKeyEvent[] = [];
    strokes: IVirtualKeyStroke[] = [];
    lastOutDownTick: number = 0;
    lastOutputStroke: IVirtualKeyStroke | undefined = undefined;
    lastOutputStrokeUpTick: number = 0;
  })();

  function processInputQueue() {
    const { inputQueue, strokes } = local;
    Arrays.removeIf(inputQueue, (ev) => {
      if (ev.type === 'down') {
        const { virtualKey, attachedModifiers } = ev;
        strokes.push({
          virtualKey,
          attachedModifiers,
          outDownTick: 0,
          canRelease: false
        });
        return true;
      } else {
        const stroke = strokes.find(
          (s) => s.virtualKey === ev.virtualKey && !s.canRelease
        );
        if (stroke) {
          stroke.canRelease = true;
          return true;
        }
      }
      return false;
    });
  }

  function readOutputQueueOne(): IVirtualKeyEvent | undefined {
    const { strokes } = local;
    const curTick = Date.now();

    let stop = false;

    for (const stroke of strokes) {
      let downAcceptableTick =
        local.lastOutDownTick + cfg.outputMinimumDownEventInterval;
      if (
        local.lastOutputStroke &&
        stroke.virtualKey === local.lastOutputStroke.virtualKey
      ) {
        downAcceptableTick =
          local.lastOutputStrokeUpTick +
          cfg.outputMinimumStrokeIntervalBetweenSameKeyId;
      }
      if (!stop && !stroke.outDownTick && curTick > downAcceptableTick) {
        local.lastOutDownTick = curTick;
        stroke.outDownTick = curTick;
        const { virtualKey, attachedModifiers } = stroke;
        return {
          type: 'down',
          virtualKey,
          attachedModifiers
        };
      }
      if (!stroke.outDownTick) {
        stop = true;
      }

      if (
        stroke.outDownTick &&
        stroke.canRelease &&
        curTick > stroke.outDownTick + cfg.outputMinimumStrokeDuration
      ) {
        Arrays.remove(strokes, stroke);
        local.lastOutputStroke = stroke;
        local.lastOutputStrokeUpTick = Date.now();
        return {
          type: 'up',
          virtualKey: stroke.virtualKey
        };
      }
    }
    return undefined;
  }

  function pushVirtualKeyEvent(ev: IVirtualKeyEvent) {
    local.inputQueue.push(ev);
  }

  function readQueuedEventOne(): IVirtualKeyEvent | undefined {
    processInputQueue();
    const ev = readOutputQueueOne();
    return ev;
  }

  export function pushVirtualKey(
    virtualKey: VirtualKey,
    attachedModifiers: ModifierVirtualKey[] = []
  ) {
    pushVirtualKeyEvent({
      type: 'down',
      virtualKey,
      attachedModifiers
    });
  }

  export function removeVirtualKey(virtualKey: VirtualKey) {
    pushVirtualKeyEvent({
      type: 'up',
      virtualKey
    });
  }

  export function processUpdate() {
    const ev = readQueuedEventOne();
    if (ev) {
      if (ev.type === 'down') {
        ModuleR_VirtualKeyBinder.pushVirtualKey(
          ev.virtualKey,
          ev.attachedModifiers
        );
      } else {
        ModuleR_VirtualKeyBinder.removeVirtualKey(ev.virtualKey);
      }
    }
  }
}
