import {
  IKeyAssignEntry,
  IEditModel,
  fallbackProfileData
} from '~defs/ProfileData';
import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';

export interface IKeyBindingInfo {
  assign: IKeyAssignEntry;
  timeStamp: number;
}

export interface IHoldKeyBind {
  keyId: string;
  virtualKey: VirtualKey;
  attachedModifiers: ModifierVirtualKey[];
}

export type PriorityVirtualKey =
  | VirtualKey
  | 'PK_SortOrder_Forward'
  | 'PK_SortOrder_Backward';

export type IKeyStrokeAssignEvent =
  | {
      type: 'down';
      keyId: string;
      assign: IKeyAssignEntry;
      priorityVirtualKey: PriorityVirtualKey;
      tick: number;
    }
  | {
      type: 'up';
      keyId: string;
      priorityVirtualKey: PriorityVirtualKey;
      tick: number;
    };

export const logicSimulatorStateC = new (class {
  editModel: IEditModel = fallbackProfileData;
  keyBindingInfoDict: { [keyId: string]: IKeyBindingInfo } = {};
  holdKeyBinds: IHoldKeyBind[] = [];
})();

export const logicSimulatorCConfig = new (class {
  usePrioritySorter: boolean = false;
  useImmediateDownUp: boolean = false;
  useKeyBindEventAligner: boolean = false;
})();
logicSimulatorCConfig.usePrioritySorter = true;
logicSimulatorCConfig.useImmediateDownUp = false;
logicSimulatorCConfig.useKeyBindEventAligner = true;

// logicSimulatorCConfig.usePrioritySorter = false;
// logicSimulatorCConfig.useImmediateDownUp = false;
// logicSimulatorCConfig.useKeyBindEventAligner = true;
