import { VirtualKey, ModifierVirtualKey } from '~model/HighLevelDefs';

export interface ILayer {
  layerId: string;
  layerName: string;
  layerRole: 'main' | 'shift' | 'custom';
}

export type LayerInvocationMode = 'hold' | 'oneshot' | 'modal' | 'unmodal';

export type IKeyAssignEntry =
  | {
      type: 'keyInput';
      virtualKey: VirtualKey;
      modifiers?: ModifierVirtualKey[];
    }
  | {
      type: 'holdLayer';
      targetLayerId: string;
      layerInvocationMode: LayerInvocationMode;
    }
  | {
      type: 'holdModifier';
      modifierKey: ModifierVirtualKey;
      isOneShot: boolean;
    };

export type IKeyAssignsSet = {
  //key: kuX.laY.pri|sec
  [key: string]: IKeyAssignEntry | undefined;
};

export interface IEditModel {
  version: 1;
  layers: ILayer[];
  keyAssigns: IKeyAssignsSet;
  breedName: string;
}

export interface IProfileManagerStatus {
  currentProfileName: string;
  allProfileNames: string[];
  loadedEditModel: IEditModel | undefined;
  errorMessage: string;
}
