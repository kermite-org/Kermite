import {
  IAssignEntry,
  IDisplayKeyboardDesign,
  ILayer,
  IProfileData,
} from '~/shared';

export interface ISystemLayoutModel {
  systemLayoutIndex: number;
  setSystemLayoutIndex(layoutIndex: number): void;
}

export interface IRoutingChannelModel {
  routingChannel: number;
  setRoutingChannel(channel: number): void;
}

export interface ILayerStackLayerItem {
  layerId: string;
  layerName: string;
  isActive: boolean;
}
export interface IPlayerModel {
  holdKeyIndices: number[];
  keyStates: { [keyId: string]: boolean };
  layers: ILayer[];
  displayDesign: IDisplayKeyboardDesign;
  layerStackViewSource: ILayerStackLayerItem[];
  getDynamicKeyAssign(keyUnitId: string): IAssignEntry | undefined;
  checkShiftHold(): boolean;
  setProfileData(profile: IProfileData): void;
  initialize(): void;
  finalize(): void;
}
