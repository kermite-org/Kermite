import {
  fallbackProfileData,
  IAssignOperation,
  IProfileData
} from '~defs/ProfileData';
import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';

export interface IKeyIndexKeyEvent {
  keyIndex: number;
  isDown: boolean;
}

export interface IKeyIdKeyEvent {
  keyId: string;
  isDown: boolean;
}

//down-tap-up
//down-hold-up
export type IKeyTrigger = 'down' | 'tap' | 'hold' | 'up';

export interface IKeyTriggerEvent {
  keyId: string;
  trigger: IKeyTrigger;
}

export type PriorityVirtualKey =
  | VirtualKey
  | 'PK_SortOrder_Forward'
  | 'PK_SortOrder_Backward';

export type IKeyStrokeAssignEvent =
  | {
      type: 'down';
      keyId: string;
      trigger: IKeyTrigger;
      op: IAssignOperation;
      priorityVirtualKey: PriorityVirtualKey;
      tick: number;
    }
  | {
      type: 'up';
      keyId: string;
      priorityVirtualKey: PriorityVirtualKey;
      tick: number;
    };

export type IVirtualKeyEvent =
  | {
      isDown: true;
      virtualKey: VirtualKey;
      attachedModifiers?: ModifierVirtualKey[];
    }
  | {
      isDown: false;
      virtualKey: VirtualKey;
    };

export interface IHoldKeySet {
  virtualKey: VirtualKey;
  attachedModifiers: ModifierVirtualKey[];
}

export const logicSimulatorStateC = new (class {
  profileData: IProfileData = fallbackProfileData;
  holdLayerIds: Set<string> = new Set(['la0']);
  // holdKeySets: IHoldKeySet[] = [];
})();

export const logicSimulatorCConfig = new (class {
  usePrioritySorter: boolean = false;
  useImmediateDownUp: boolean = false;
})();
// logicSimulatorCConfig.usePrioritySorter = true;
// logicSimulatorCConfig.useImmediateDownUp = true;

export interface IModuleIO<TEventIn, TEventOut> {
  push(ev: TEventIn): void;
  emit(ev: TEventOut): void;
  chainTo(listener: (ev: TEventOut) => void): void;
}

export function createModuleIo<TEventIn, TEventOut>(
  internalHandler: (ev: TEventIn) => void
): IModuleIO<TEventIn, TEventOut> {
  let listener: ((ev: TEventOut) => void) | undefined = undefined;
  return {
    push(ev: TEventIn) {
      internalHandler(ev);
    },
    emit(ev: TEventOut) {
      listener?.(ev);
    },
    chainTo(_listener: (ev: TEventOut) => void) {
      listener = _listener;
    }
  };
}

export function connectModuleIo<T>(
  source: IModuleIO<any, T>,
  dest: IModuleIO<T, any>
) {
  source.chainTo(dest.push);
}

interface IModuleChainer<D> {
  chain<N>(next: IModuleIO<D, N>): IModuleChainer<N>;
}

export function createModuleFlow<S, D>(
  source: IModuleIO<S, D>
): IModuleChainer<D> {
  return {
    chain<N>(next: IModuleIO<D, N>): IModuleChainer<N> {
      source.chainTo(next.push);
      return createModuleFlow<D, N>(next);
    }
  };
}
