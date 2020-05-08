import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { Arrays } from '~funcs/Arrays';

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

interface BindingStroke {
  keyId: string;
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
  })();

  const cfg = {
    outputMinimumDownEventInterval: 70,
    outputMinimumStrokeDuration: 70
  };

  function processInputQueue() {
    const { inputQueue, strokes } = local;
    Arrays.removeIf(inputQueue, (ev) => {
      if (ev.type === 'down') {
        const { keyId, virtualKey, attachedModifiers } = ev;
        const stroke = strokes.find((s) => s.keyId === keyId);
        if (!stroke) {
          strokes.push({
            keyId,
            virtualKey,
            attachedModifiers,
            outDownTick: 0,
            canRelease: false
          });
          return true;
        }
      } else {
        const stroke = strokes.find(
          (s) => s.keyId === ev.keyId && !s.canRelease
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

    for (const stroke of strokes) {
      if (
        curTick > local.lastOutDownTick + cfg.outputMinimumDownEventInterval &&
        !stroke.outDownTick
      ) {
        local.lastOutDownTick = curTick;
        stroke.outDownTick = curTick;
        const { keyId, virtualKey, attachedModifiers } = stroke;
        return {
          type: 'down',
          keyId,
          virtualKey,
          attachedModifiers
        };
      }
      if (
        stroke.outDownTick &&
        stroke.canRelease &&
        curTick > stroke.outDownTick + cfg.outputMinimumStrokeDuration
      ) {
        Arrays.remove(strokes, stroke);
        return {
          type: 'up',
          keyId: stroke.keyId
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
