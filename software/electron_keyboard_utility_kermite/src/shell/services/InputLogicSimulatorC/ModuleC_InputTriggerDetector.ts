import {
  createModuleIo,
  IKeyTriggerEvent,
  IKeyIdKeyEvent,
  IKeyTrigger,
  logicSimulatorCConfig
} from './LogicSimulatorCCommon';

class TriggerResolver {
  keyId: string;
  downTick: number = 0;
  private destProc: (keyId: string, trigger: IKeyTrigger) => void;
  private _resolving: boolean = false;

  constructor(
    keyId: string,
    destProc: (keyId: string, trigger: IKeyTrigger) => void
  ) {
    this.keyId = keyId;
    this.destProc = destProc;
  }

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
      const TH = logicSimulatorCConfig.tapHoldThretholdMs;
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
      const TH = logicSimulatorCConfig.tapHoldThretholdMs;
      if (curTick >= this.downTick + TH) {
        this.emitTrigger('hold');
        this._resolving = false;
      }
    }
  }
}

export namespace ModuleC_InputTriggerDetector {
  export const io = createModuleIo<IKeyIdKeyEvent, IKeyTriggerEvent>(
    handleKeyInput
  );

  const local = new (class {
    triggerResolvers: { [keyId: string]: TriggerResolver } = {};
  })();

  function onTriggerDetected(keyId: string, trigger: IKeyTrigger) {
    io.emit({ keyId, trigger });
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

  function resolveInterruptHold(keyId: string) {
    Object.values(local.triggerResolvers)
      .filter((tr) => tr.resolving && tr.keyId !== keyId)
      .forEach((tr) => tr.inputInterrupt());
  }

  function resolveInterruptHold2(keyId: string, downTickTh: number) {
    Object.values(local.triggerResolvers)
      .filter(
        (tr) => tr.resolving && tr.keyId !== keyId && tr.downTick < downTickTh
      )
      .forEach((tr) => tr.inputInterrupt());
  }

  function handleKeyInput(ev: { keyId: string; isDown: boolean }) {
    const { keyId, isDown } = ev;
    const resolver = getKeyResolverCached(keyId);

    const { useInterruptHold, primeryDefaultTrigger } = logicSimulatorCConfig;
    if (useInterruptHold) {
      //down interrupt hold
      if (primeryDefaultTrigger === 'down' && isDown) {
        resolveInterruptHold(keyId);
      }
      //tap interrupt hold
      if (primeryDefaultTrigger === 'tap' && resolver.resolving && !isDown) {
        resolveInterruptHold2(keyId, resolver.downTick);
      }
    }

    if (isDown) {
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
