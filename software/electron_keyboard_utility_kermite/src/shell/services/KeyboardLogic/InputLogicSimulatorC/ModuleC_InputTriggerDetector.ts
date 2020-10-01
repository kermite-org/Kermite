import {
  createModuleIo,
  IKeyIdKeyEvent,
  IKeyTrigger,
  IKeyTriggerEvent,
  logicSimulatorStateC
} from './LogicSimulatorCCommon';

class TriggerResolver {
  keyId: string;
  downTick: number = 0;
  private destProc: (keyId: string, trigger: IKeyTrigger) => void;
  private _resolving: boolean = false;
  private tapHoldThreshold: number;

  constructor(
    keyId: string,
    destProc: (keyId: string, trigger: IKeyTrigger) => void,
    tapHoldThreshold: number
  ) {
    this.keyId = keyId;
    this.destProc = destProc;
    this.tapHoldThreshold = tapHoldThreshold;
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
      const curTick = Date.now();
      if (
        this.tapHoldThreshold &&
        curTick < this.downTick + this.tapHoldThreshold
      ) {
        this.emitTrigger('tap');
        this._resolving = false;
      }
    }
    this.emitTrigger('up');
  }

  tick() {
    if (this._resolving) {
      const curTick = Date.now();
      if (
        this.tapHoldThreshold &&
        curTick >= this.downTick + this.tapHoldThreshold
      ) {
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
      const { profileData } = logicSimulatorStateC;
      const tapHoldThreshold =
        (profileData.assignType === 'dual' &&
          profileData.settings.tapHoldThresholdMs) ||
        0;
      resolver = triggerResolvers[keyId] = new TriggerResolver(
        keyId,
        onTriggerDetected,
        tapHoldThreshold
      );
    }
    return resolver;
  }

  function resolveInterruptHold(keyId: string, downTickTh: number) {
    Object.values(local.triggerResolvers)
      .filter(
        (tr) => tr.resolving && tr.keyId !== keyId && tr.downTick < downTickTh
      )
      .forEach((tr) => tr.inputInterrupt());
  }

  function handleKeyInput(ev: { keyId: string; isDown: boolean }) {
    const { keyId, isDown } = ev;
    const resolver = getKeyResolverCached(keyId);

    const { profileData } = logicSimulatorStateC;
    if (profileData.assignType === 'dual') {
      const { useInterruptHold, primaryDefaultTrigger } = profileData.settings;
      if (useInterruptHold) {
        // down interrupt hold
        if (primaryDefaultTrigger === 'down' && isDown) {
          resolveInterruptHold(keyId, Date.now());
        }
        // tap interrupt hold
        if (primaryDefaultTrigger === 'tap' && resolver.resolving && !isDown) {
          resolveInterruptHold(keyId, resolver.downTick);
        }
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
