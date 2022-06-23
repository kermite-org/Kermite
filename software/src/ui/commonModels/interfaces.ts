import {
  IAssignEntry,
  IDisplayKeyboardDesign,
  ILayer,
  IProfileData,
  IProfileSettings,
} from '~/shared';

export interface ISystemLayoutModel {
  systemLayoutIndex: number;
  setSystemLayoutIndex(layoutIndex: number): void;
}

export interface IRoutingChannelModel {
  routingChannel: number;
  setRoutingChannel(channel: number): void;
}

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
  displayDesign: IDisplayKeyboardDesign;
  layerStackItems: ILayerStackItem[];
  shiftHold: boolean;
  getDynamicKeyAssign(keyUnitId: string): IAssignEntry | undefined;
  setProfileData(profile: IProfileData): void;
}
