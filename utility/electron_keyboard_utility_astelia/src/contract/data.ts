import { VirtualKey } from '~model/HighLevelDefs';

export interface ILayer {
  layerId: string;
  layerName: string;
  layerRole: 'main' | 'shift' | 'custom';
}

export type IKeyAssignEntry =
  | {
      type: 'keyInput';
      virtualKey: VirtualKey;
    }
  | {
      type: 'holdLayer';
      targetLayerId: string;
    };

export type IKeyAssignsSet = {
  //key: kuX.laY.pri|sec
  [key: string]: IKeyAssignEntry | undefined;
};

export interface IEditModel {
  version: 1;
  layers: ILayer[];
  keyAssigns: IKeyAssignsSet;
}

export interface IProfileManagerStatus {
  currentProfileName: string;
  allProfileNames: string[];
  loadedEditModel: IEditModel | undefined;
  errorMessage: string;
}
