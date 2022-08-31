import { SystemAction } from '~/shared/defs/commandDefinitions';
import { IConsumerControlAction } from '~/shared/defs/consumerControlDefinitions';
import {
  createFallbackPersistKeyboardDesign,
  IPersistKeyboardDesign,
} from './keyboardDesign';
import { VirtualKey } from './virtualKeys';

export type ILayerDefaultScheme = 'block' | 'transparent';
export interface ILayer {
  layerId: string;
  layerName: string;
  attachedModifiers: number;
  defaultScheme: ILayerDefaultScheme;
  exclusionGroup: number;
  initialActive: boolean;
}

export type IHoldFunctionInvocationMode =
  | 'hold'
  | 'turnOn'
  | 'turnOff'
  | 'toggle'
  | 'oneshot';

export type LayerInvocationMode = IHoldFunctionInvocationMode;

export type IAssignOperationType = 'none' | 'keyInput' | 'layerCall';

export type IAssignOperationKeyInput = {
  type: 'keyInput';
  virtualKey: VirtualKey;
  attachedModifiers: number;
  immediateRelease?: boolean;
};

export type IAssignOperationLayerCall = {
  type: 'layerCall';
  targetLayerId: string;
  invocationMode: IHoldFunctionInvocationMode;
};

export type IAssignOperationClearExclusiveLayers = {
  type: 'layerClearExclusive';
  targetExclusionGroup: number;
};

export type IAssignOperationSystemAction = {
  type: 'systemAction';
  action: SystemAction;
  payloadValue: number;
};

export type IAssignOperationConsumerControl = {
  type: 'consumerControl';
  action: IConsumerControlAction;
};

export type IAssignOperation =
  | IAssignOperationKeyInput
  | IAssignOperationLayerCall
  | IAssignOperationClearExclusiveLayers
  | IAssignOperationSystemAction
  | IAssignOperationConsumerControl;

export type IProfileAssignType = 'single' | 'dual';

export type IAssignEntryType = 'none' | 'single' | 'dual';

export type IAssignEntry_Single = {
  type: 'single';
  op?: IAssignOperation;
};

export type IAssignEntry_Dual = {
  type: 'dual';
  primaryOp?: IAssignOperation; // down, tap(if secondaryOp exists)
  secondaryOp?: IAssignOperation; // hold
  tertiaryOp?: IAssignOperation; // double-tap
};

export type IAssignEntry_Block = {
  type: 'block';
};

export type IAssignEntry_Transparent = {
  type: 'transparent';
};

export type IAssignEntry =
  | IAssignEntry_Single
  | IAssignEntry_Dual
  | IAssignEntry_Block
  | IAssignEntry_Transparent;

export type IAssignEntryWithLayerFallback =
  | IAssignEntry_Single
  | IAssignEntry_Dual
  | IAssignEntry_Block
  | IAssignEntry_Transparent
  | { type: 'layerFallbackTransparent' }
  | { type: 'layerFallbackBlock' };

export type IShiftCancelMode = 'none' | 'shiftLayer' | 'all';

export type IPrimaryDefaultTrigger = 'down' | 'tap';

export type ISecondaryDefaultTrigger = 'down' | 'hold';

export type IProfileSettings_Single = {
  assignType: 'single';
  shiftCancelMode: IShiftCancelMode;
};

export type IProfileSettings_Dual = {
  assignType: 'dual';
  shiftCancelMode: IShiftCancelMode;
  primaryDefaultTrigger: IPrimaryDefaultTrigger;
  secondaryDefaultTrigger: ISecondaryDefaultTrigger;
  useInterruptHold: boolean;
  tapHoldThresholdMs: number;
};

export type IProfileSettings = IProfileSettings_Single | IProfileSettings_Dual;

export type IProfileSettingsM = {
  assignType: 'single' | 'dual';
  shiftCancelMode: IShiftCancelMode;
  primaryDefaultTrigger?: IPrimaryDefaultTrigger;
  secondaryDefaultTrigger?: ISecondaryDefaultTrigger;
  useInterruptHold?: boolean;
  tapHoldThresholdMs?: number;
};

export type IAssignsDictionary = {
  // laX.kuY
  [address: string]: IAssignEntry | undefined;
};

export type IMappingEntry = {
  itemId: string;
  channelIndex: number;
  srcKey: VirtualKey;
  srcModifiers: number;
  dstKey: VirtualKey;
  dstModifiers: number;
};

export type IProfileData = {
  projectId: string;
  keyboardDesign: IPersistKeyboardDesign;
  settings: IProfileSettings;
  layers: ILayer[];
  assigns: IAssignsDictionary;
  mappingEntries: IMappingEntry[];
};

export type IPersistAssignEntry = {
  layerId: string;
  keyId: string;
  usage: IAssignEntry;
};

export type ProfileFormatRevisionLatest = 'PRF06';
export const profileFormatRevisionLatest = 'PRF06';

export type IPersistProfileData = {
  formatRevision: ProfileFormatRevisionLatest;
  projectId: string;
  keyboardDesign: IPersistKeyboardDesign;
  settings: IProfileSettings;
  layers: ILayer[];
  assigns: IPersistAssignEntry[];
  mappingEntries: IMappingEntry[];
};

export type IPersistProfileFileData = IPersistProfileData & {
  profileName: string;
};

export const fallbackPersistProfileData: IPersistProfileData = {
  formatRevision: 'PRF06',
  projectId: '',
  keyboardDesign: createFallbackPersistKeyboardDesign(),
  settings: {
    assignType: 'single',
    shiftCancelMode: 'none',
  },
  layers: [
    {
      layerId: 'la0',
      layerName: 'main',
      defaultScheme: 'block',
      attachedModifiers: 0,
      exclusionGroup: 0,
      initialActive: true,
    },
  ],
  assigns: [],
  mappingEntries: [],
};

export const fallbackProfileData: IProfileData = {
  projectId: '',
  keyboardDesign: createFallbackPersistKeyboardDesign(),
  settings: {
    assignType: 'single',
    shiftCancelMode: 'none',
  },
  layers: [
    {
      layerId: 'la0',
      layerName: 'main',
      defaultScheme: 'block',
      attachedModifiers: 0,
      exclusionGroup: 0,
      initialActive: true,
    },
  ],
  assigns: {},
  mappingEntries: [],
};
