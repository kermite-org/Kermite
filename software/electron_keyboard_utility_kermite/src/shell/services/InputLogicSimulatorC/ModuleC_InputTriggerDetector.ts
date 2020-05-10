import { ModuleD_KeyInputAssignReader } from './ModuleD_KeyInputAssignReader';

const TH = 400;

type IKeyTrigger = 'down' | 'tap' | 'hold' | 'up';

class TriggerResolver {
  private downTick: number = 0;
  private _resolving: boolean = false;

  constructor(
    private keyId: string,
    private destProc: (keyId: string, trigger: IKeyTrigger) => void
  ) {}

  private emitTrigger(trigger: IKeyTrigger) {
    this.destProc(this.keyId, trigger);
  }

  get resolving() {
    return this._resolving;
  }

  inputDown() {
    this.downTick = Date.now();
    this.emitTrigger('down');
    this._resolving = true;
  }

  inputInterrupt() {
    if (this._resolving) {
      this.emitTrigger('hold');
      this._resolving = false;
    }
  }

  inputUp() {
    if (this._resolving) {
      const curTick = Date.now();
      if (curTick < this.downTick + TH) {
        this.emitTrigger('tap');
        this._resolving = false;
      }
    }
    this.emitTrigger('up');
  }

  tick() {
    if (this._resolving) {
      const curTick = Date.now();
      if (curTick >= this.downTick + TH) {
        this.emitTrigger('hold');
        this._resolving = false;
      }
    }
  }
}

export namespace ModuleC_InputTriggerDetector {
  const local = new (class {
    triggerResolvers: { [keyId: string]: TriggerResolver } = {};
  })();

  function onTriggerDetected(keyId: string, trigger: IKeyTrigger) {
    ModuleD_KeyInputAssignReader.processEvent({
      keyId,
      trigger
    });
  }

  function getKeyResolverCached(keyId: string) {
    const { triggerResolvers } = local;
    let resolver = triggerResolvers[keyId];
    if (!resolver) {
      resolver = triggerResolvers[keyId] = new TriggerResolver(
        keyId,
        onTriggerDetected
      );
    }
    return resolver;
  }

  export function handleKeyInput(keyId: string, isDown: boolean) {
    const resolver = getKeyResolverCached(keyId);
    if (isDown) {
      if (1) {
        Object.values(local.triggerResolvers)
          .filter((tr) => tr.resolving)
          .forEach((tr) => tr.inputInterrupt());
      }

      resolver.inputDown();
    } else {
      resolver.inputUp();
    }
  }

  export function handleTicker() {
    const { triggerResolvers } = local;
    for (const keyId in triggerResolvers) {
      triggerResolvers[keyId].tick();
    }
  }
}
