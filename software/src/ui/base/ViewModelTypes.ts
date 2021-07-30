import { IDisplayKeyboardDesign, IDisplayKeyShape } from '~/shared';

export interface ICustomKeyUnitViewModelBase {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  primaryText: string;
  secondaryText: string;
  isLayerFallback: boolean;
  shape: IDisplayKeyShape;
}

export interface IEditKeyUnitCardViewModel {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  shape: IDisplayKeyShape;
  isCurrent: boolean;
  setCurrent: () => void;
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;
  isLayerFallback: boolean;
  isHold: boolean;
  shiftHold: boolean;
}

export interface IPresetKeyUnitViewModel {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;
  isLayerFallback: boolean;
  shape: IDisplayKeyShape;
}

export interface IWidgetKeyUnitCardViewModel {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;
  isLayerFallback: boolean;
  isHold: boolean;
  shape: IDisplayKeyShape;
  shiftHold: boolean;
}

export interface IOperationCardViewModel {
  sig: string;
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
  isEnabled: boolean;
  hint: string;
}

export type IGeneralMenuItem =
  | { type: 'menuEntry'; text: string; handler: () => void; disabled?: boolean }
  | { type: 'separator' };

export interface IProjectKeyboardListProjectItem {
  projectId: string;
  keyboardName: string;
  design: IDisplayKeyboardDesign;
}
