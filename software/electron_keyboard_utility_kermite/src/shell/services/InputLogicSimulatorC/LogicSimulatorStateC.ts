import {
  IKeyAssignEntry,
  IEditModel,
  fallbackProfileData
} from '~defs/ProfileData';

interface IKeyBindingInfo {
  assign: IKeyAssignEntry;
  timeStamp: number;
}

export const logicSimulatorStateC = new (class {
  editModel: IEditModel = fallbackProfileData;
  keyBindingInfoDict: { [keyId: string]: IKeyBindingInfo } = {};
})();
