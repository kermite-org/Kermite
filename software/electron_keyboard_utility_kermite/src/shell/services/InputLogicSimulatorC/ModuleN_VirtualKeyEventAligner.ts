import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { ModuleR_VirtualKeyBinder } from './ModuleR_VirtualKeyBinder';

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

  constructor(
    prev: VirtualStroke | undefined,
    virtualKey: VirtualKey,
    attachedModifiers: ModifierVirtualKey[]
    // private ignoreOneInputUp?: boolean
  ) {
    this.prevStroke = prev;
    this.virtualKey = virtualKey;
    this.attachedModifiers = attachedModifiers;
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
    ModuleR_VirtualKeyBinder.pushVirtualKey(
      this.virtualKey,
      this.attachedModifiers
    );
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
    ModuleR_VirtualKeyBinder.removeVirtualKey(this.virtualKey);
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
  const local = new (class {
    strokes: VirtualStroke[] = [];
    lastStroke: VirtualStroke | undefined = undefined;
  })();

  export function pushVirtualKey(
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
      attachedModifiers
      // strokeOverwritten
    );
    local.strokes.push(stroke);
    local.lastStroke = stroke;
  }

  export function removeVirtualKey(virtualKey: VirtualKey) {
    const stroke = local.strokes.find(
      (s) => s.virtualKey === virtualKey && s.inputHold
    );
    if (stroke) {
      stroke.fireInputUp();
    }
  }

  export function processUpdate() {
    for (const stroke of local.strokes) {
      stroke.update();
    }
    local.strokes = local.strokes.filter((s) => !s.completed);
  }
}
