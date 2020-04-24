import { LayerInvocationMode, IKeyAssignsSet } from '~contract/data';

export type TAdhocShift = 'down' | 'up' | undefined;

export interface IVirtualStroke {
  keyCode: number;
  adhocShift?: TAdhocShift;
  attachedModifierKeyCodes?: number[];
}

export type IStrokeEmitterFunction = (ev: {
  keyCode: number;
  isDown: boolean;
}) => void;

export type LogicalKeyAction = { rcode: string } & (
  | {
      type: 'keyInput';
      stroke: IVirtualStroke;
      // immediateRelease: boolean;
    }
  | {
      type: 'holdLayer';
      targetLayerId: string;
      layerInvocationMode: LayerInvocationMode;
    }
  | {
      type: 'holdModifier';
      modifierKeyCode: number;
      isOneShot: boolean;
    }
);

export interface IModelKeyAssignsProvider {
  keyAssigns: IKeyAssignsSet;
  keyUnitIdTable: { [KeyIndex: number]: string };
}

export interface LayerState {
  holdLayerId: string;
  modalLayerId: string;
  oneshotLayerId: string;
  oneshotModifierKeyCode: number | undefined;
}
