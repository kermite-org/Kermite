import {
  IAssignEntry,
  IDisplayKeyboardLayout,
  ILayer,
  IProfileData,
  IProfileSettings,
} from '~/app-shared';

export interface ILayerStackItem {
  layerId: string;
  layerName: string;
  isActive: boolean;
}

export interface IPlayerModel {
  holdKeyIndices: number[];
  keyStates: { [keyId: string]: boolean };
  layers: ILayer[];
  profileSettings: IProfileSettings;
  displayDesign: IDisplayKeyboardLayout;
  layerStackItems: ILayerStackItem[];
  shiftHold: boolean;
  getDynamicKeyAssign(keyUnitId: string): IAssignEntry | undefined;
  setProfileData(profile: IProfileData): void;
}
