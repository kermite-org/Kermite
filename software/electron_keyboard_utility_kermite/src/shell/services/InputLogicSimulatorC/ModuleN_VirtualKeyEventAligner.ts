import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { createModuleIo, IVirtualKeyEvent } from './LogicSimulatorCCommon';

const cfg = {
  // outputMinimumDownEventInterval: 70,
  // outputMinimumStrokeDuration: 70,
  // outputMinimumStrokeIntervalBetweenSameKeyId: 50
  outputMinimumDownEventInterval: 10,
  outputMinimumStrokeDuration: 10,
  outputMinimumStrokeIntervalBetweenSameKeyId: 10
};

class VirtualStroke {
  prevStroke?: VirtualStroke;
  virtualKey: VirtualKey;
  attachedModifiers?: ModifierVirtualKey[];
  inputDownFired: boolean = false;
  outputDownTick?: number;
  outputUpTick?: number;
  emitter: (ev: IVirtualKeyEvent) => void;

  constructor(
    prev: VirtualStroke | undefined,
    virtualKey: VirtualKey,
    attachedModifiers: ModifierVirtualKey[],
    emitter: (ev: IVirtualKeyEvent) => void
    // private ignoreOneInputUp?: boolean
  ) {
    this.prevStroke = prev;
    this.virtualKey = virtualKey;
    this.attachedModifiers = attachedModifiers;
    this.emitter = emitter;
  }

  fireInputUp() {
    // if (this.ignoreOneInputUp) {
    //   this.ignoreOneInputUp = false;
    //   return;
    // }
    this.inputDownFired = true;
  }

  get inputHold() {
    return !this.inputDownFired;
  }

  private get canOutputDown(): boolean {
    const curr = Date.now();
    if (!this.outputDownTick) {
      const { prevStroke: prev } = this;
      if (prev && prev.virtualKey === this.virtualKey) {
        return (
          (prev.outputUpTick &&
            curr >
              prev.outputUpTick +
                cfg.outputMinimumStrokeIntervalBetweenSameKeyId) ||
          false
        );
      } else if (prev) {
        return (
          (prev.outputDownTick &&
            curr > prev.outputDownTick + cfg.outputMinimumDownEventInterval) ||
          false
        );
      } else {
        return true;
      }
    }
    return false;
  }

  private outputDown() {
    const { virtualKey, attachedModifiers } = this;
    this.emitter({ virtualKey, attachedModifiers, isDown: true });
    this.outputDownTick = Date.now();
  }

  private get canOutputUp(): boolean {
    const curr = Date.now();
    return (
      (this.outputDownTick &&
        !this.outputUpTick &&
        this.inputDownFired &&
        curr > this.outputDownTick + cfg.outputMinimumStrokeDuration) ||
      false
    );
  }

  private outputUp() {
    const { virtualKey } = this;
    this.emitter({ virtualKey, isDown: false });
    this.outputUpTick = Date.now();
  }

  get completed() {
    return !!this.outputUpTick;
  }

  update() {
    if (this.canOutputDown) {
      this.outputDown();
    }
    if (this.canOutputUp) {
      return this.outputUp();
    }
  }
}

export namespace ModuleN_VirtualKeyEventAligner {
  export const io = createModuleIo<IVirtualKeyEvent, IVirtualKeyEvent>(
    handleInputEvent
  );

  const local = new (class {
    strokes: VirtualStroke[] = [];
    lastStroke: VirtualStroke | undefined = undefined;
  })();

  function pushVirtualKey(
    virtualKey: VirtualKey,
    attachedModifiers: ModifierVirtualKey[] = []
  ) {
    // const holdingSameKeyStroke = local.strokes.find(
    //   (s) => s.virtualKey === virtualKey && s.inputHold
    // );
    // if (holdingSameKeyStroke) {
    //   console.log(`hsks found`, virtualKey);
    //   holdingSameKeyStroke.fireInputUp();
    // }
    // const strokeOverwritten = !!holdingSameKeyStroke;

    const stroke = new VirtualStroke(
      local.lastStroke,
      virtualKey,
      attachedModifiers,
      io.emit
      // strokeOverwritten
    );
    local.strokes.push(stroke);
    local.lastStroke = stroke;
  }

  function removeVirtualKey(virtualKey: VirtualKey) {
    const stroke = local.strokes.find(
      (s) => s.virtualKey === virtualKey && s.inputHold
    );
    if (stroke) {
      stroke.fireInputUp();
    }
  }

  function handleInputEvent(ev: IVirtualKeyEvent) {
    if (ev.isDown) {
      pushVirtualKey(ev.virtualKey, ev.attachedModifiers);
    } else {
      removeVirtualKey(ev.virtualKey);
    }
  }

  export function processUpdate() {
    for (const stroke of local.strokes) {
      stroke.update();
    }
    local.strokes = local.strokes.filter((s) => !s.completed);
  }
}
