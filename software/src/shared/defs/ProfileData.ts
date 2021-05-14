import {
  createFallbackPersistKeyboardDesign,
  IPersistKeyboardDesign,
} from './KeyboardDesign';
import { ModifierVirtualKey, VirtualKey } from './VirtualKeys';

export type ILayerDefaultScheme = 'block' | 'transparent';
export interface ILayer {
  layerId: string;
  layerName: string;
  attachedModifiers?: ModifierVirtualKey[];
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

export type IAssignOperationType =
  | 'none'
  | 'keyInput'
  | 'layerCall'
  | 'modifierCall';

export type IAssingOperationKeyInput = {
  type: 'keyInput';
  virtualKey: VirtualKey;
  attachedModifiers?: ModifierVirtualKey[];
  immediateRelease?: boolean;
};

export type IAssignOperationLayerCall = {
  type: 'layerCall';
  targetLayerId: string;
  invocationMode: IHoldFunctionInvocationMode;
};

export type IAssignOperationModifierCall = {
  type: 'modifierCall';
  modifierKey: ModifierVirtualKey;
  isOneShot: boolean;
};

export type IAssignOperationClearExclusiveLayers = {
  type: 'layerClearExclusive';
  targetExclusionGroup: number;
};

export type IAssignOperation =
  | IAssingOperationKeyInput
  | IAssignOperationLayerCall
  | IAssignOperationModifierCall
  | IAssignOperationClearExclusiveLayers;
// | {
//     type: 'fixedText';
//     text: string;
//   }
// | {
//     type: 'mouseOperation';
//     action: 'leftdown' | 'leftup' | 'leftclick';
//   };

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

export type IAssingEntry_Block = {
  type: 'block';
};

export type IAssignEntry_Transparent = {
  type: 'transparent';
};

export type IAssignEntry =
  | IAssignEntry_Single
  | IAssignEntry_Dual
  | IAssingEntry_Block
  | IAssignEntry_Transparent;

export type IAssignEntryWithLayerFallback =
  | IAssignEntry_Single
  | IAssignEntry_Dual
  | IAssingEntry_Block
  | IAssignEntry_Transparent
  | { type: 'layerFallbackTransparent' }
  | { type: 'layerFallbackBlock' };

type IProfileSettings =
  | {
      assignType: 'single';
      useShiftCancel: boolean;
    }
  | {
      assignType: 'dual';
      useShiftCancel: boolean;
      primaryDefaultTrigger: 'down' | 'tap';
      useInterruptHold: boolean;
      tapHoldThresholdMs: number;
    };

export type IAssignsDictionary = {
  // laX.kuY
  [address: string]: IAssignEntry | undefined;
};

export type IMappingEntry = {
  itemId: string;
  channelIndex: number;
  srcKey: VirtualKey | 'K_RoutingSource_Any';
  srcModifiers: number;
  dstKey: VirtualKey | 'K_RoutingDest_Keep' | 'K_RoutingDest_Stop';
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

export type ProfileFormatRevisionLatest = 'PRF05';
export const profileFormatRevisionLatest = 'PRF05';

export type IPersistProfileData = {
  formatRevision: ProfileFormatRevisionLatest;
  projectId: string;
  keyboardDesign: IPersistKeyboardDesign;
  settings: IProfileSettings;
  layers: ILayer[];
  assigns: IPersistAssignEntry[];
  mappingEntries: IMappingEntry[];
};

export const fallbackProfileData: IProfileData = {
  projectId: '',
  keyboardDesign: createFallbackPersistKeyboardDesign(),
  settings: {
    assignType: 'single',
    useShiftCancel: false,
  },
  layers: [
    {
      layerId: 'la0',
      layerName: 'main',
      defaultScheme: 'block',
      exclusionGroup: 0,
      initialActive: true,
    },
  ],
  assigns: {},
  mappingEntries: [],
};
