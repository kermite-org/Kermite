import { IModelKeyAssignsProvider } from '../InputLogicSimulator/Types';
import { IAssignOperation } from '~defs/ProfileData';

export type IChannel<T> = {
  emit(ev: T): void;
  subscribe(proc: (ev: T) => void): void;
};

export class EventChannel<T> implements IChannel<T> {
  handlers: ((ev: T) => void)[] = [];
  emit(ev: T) {
    this.handlers.forEach((handler) => handler(ev));
  }

  subscribe(proc: (ev: T) => void) {
    this.handlers.push(proc);
  }
}

type IProcessEventsProc<S, D> = (src: IChannel<S>, dst: IChannel<D>) => void;

export function setupChainGeneral<S, D>(
  processEventsProc: (src: S) => D,
  srcChannel: IChannel<S>,
  dstChannel: IChannel<D>
) {
  srcChannel.subscribe((src) => {
    const dst = processEventsProc(src);
    if (dst) {
      dstChannel.emit(dst);
    }
  });
}

export interface KeyIndexKeyEvent {
  keyIndex: number;
  isDown: boolean;
}

export interface KeyIdKeyEvent {
  keyId: string;
  isDown: boolean;
}

export type TKeyTrigger = 'down' | 'tap' | 'hold';

export interface KeyTriggerEvent {
  keyId: string;
  trigger: TKeyTrigger;
}

export interface KeyAssignEvent {
  keyId: string;
  // trigger: TKeyTrigger;
  op: IAssignOperation;
}

export interface KeyAssignEventWithTick {
  keyId: string;
  // trigger: TKeyTrigger;
  op: IAssignOperation;
  tick: number;
}

export const logicSimulatorState = new (class {
  keyAssignsProvider: IModelKeyAssignsProvider = {
    keyAssigns: {},
    keyUnitIdTable: []
  };
  layerState = {
    currentLayerId: 'la0'
  };
  boundAssigns: { [keyId: string]: IAssignOperation } = {};
})();
