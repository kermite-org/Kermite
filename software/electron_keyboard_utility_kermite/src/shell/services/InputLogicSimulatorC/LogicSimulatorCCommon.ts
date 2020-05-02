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

export type IKeyStrokeAssignEvent =
  | {
      type: 'down';
      keyId: string;
      assign: IKeyAssignEntry;
      priorityVirtualKey: VirtualKey;
      tick: number;
    }
  | {
      type: 'up';
      keyId: string;
      priorityVirtualKey: VirtualKey;
      tick: number;
    };

export const logicSimulatorStateC = new (class {
  editModel: IEditModel = fallbackProfileData;
  keyBindingInfoDict: { [keyId: string]: IKeyBindingInfo } = {};
  holdKeyBinds: IHoldKeyBind[] = [];
})();

export const PrioritySorterConfig = new (class {
  bypass: boolean = false;
  waitTimeMs: number = 100;
})();
// PrioritySorterConfig.bypass = true;
