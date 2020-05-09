import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { Arrays } from '~funcs/Arrays';

export type IKeyBindingEvent =
  | {
      type: 'down';
      virtualKey: VirtualKey;
      attachedModifiers: ModifierVirtualKey[];
    }
  | {
      type: 'up';
      virtualKey: VirtualKey;
    };

interface BindingStroke {
  virtualKey: VirtualKey;
  attachedModifiers: ModifierVirtualKey[];
  outDownTick: number;
  canRelease: boolean;
}

export namespace KeyBindingEventTimingAligner {
  const local = new (class {
    inputQueue: IKeyBindingEvent[] = [];
    strokes: BindingStroke[] = [];
    lastOutDownTick: number = 0;
    lastOutputStroke: BindingStroke | undefined = undefined;
    lastOutputStrokeUpTick: number = 0;
  })();

  const cfg = {
    outputMinimumDownEventInterval: 70,
    outputMinimumStrokeDuration: 70,
    outputMinimumStrokeIntervalBetweenSameKeyId: 40
    // outputMinimumDownEventInterval: 10,
    // outputMinimumStrokeDuration: 10,
    // outputMinimumStrokeIntervalBetweenSameKeyId: 10
  };

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

  function readOutputQueueOne(): IKeyBindingEvent | undefined {
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

  export function pushKeyBindingEvent(ev: IKeyBindingEvent) {
    local.inputQueue.push(ev);
  }

  export function readQueuedEventOne(): IKeyBindingEvent | undefined {
    processInputQueue();
    const ev = readOutputQueueOne();
    return ev;
  }
}
