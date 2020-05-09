import { ModuleD_KeyInputAssignReader } from './ModuleD_KeyInputAssignReader';

const TH = 400;

type IKeyTrigger = 'down' | 'tap' | 'hold' | 'up';

class TriggerResolver {
  private downTick: number = 0;
  private resolving: boolean = false;

  constructor(
    private keyId: string,
    private destProc: (keyId: string, trigger: IKeyTrigger) => void
  ) {}

  private emitTrigger(trigger: IKeyTrigger) {
    this.destProc(this.keyId, trigger);
  }

  down() {
    this.downTick = Date.now();
    this.emitTrigger('down');
    this.resolving = true;
  }

  up() {
    const curTick = Date.now();
    if (curTick < this.downTick + TH) {
      this.emitTrigger('tap');
    }
    this.emitTrigger('up');
    this.resolving = false;
  }

  tick() {
    if (this.resolving) {
      const curTick = Date.now();
      if (curTick >= this.downTick + TH) {
        this.emitTrigger('hold');
        this.resolving = false;
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
      resolver.down();
    } else {
      resolver.up();
    }
  }

  export function handleTicker() {
    const { triggerResolvers } = local;
    for (const keyId in triggerResolvers) {
      triggerResolvers[keyId].tick();
    }
  }
}
