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

// export type IAssignEntry_SingleEx =
//   | IAssignEntry_Single
//   | IAssingEntry_Block
//   | IAssignEntry_Transparent;

// export type IAssignEntry_DualEx =
//   | IAssignEntry_Dual
//   | IAssingEntry_Block
//   | IAssignEntry_Transparent;

/*
export type IProfileData_PRF02 = {
  revision: 'PRF02';
  projectId: string;
  keyboardDesign: IPersistKeyboardDesign;
  // strong fallback layer is checked after when there aren't any assigns found
  strongFallbackLayerId?: string;
  layers: ILayer[];
} & (
  | {
      assignType: 'single';
      settings: {
        useShiftCancel: boolean;
      };
      assigns: {
        // laX.kuY
        [address: string]:
          | IAssignEntry_Single
          | IAssingEntry_Block
          | IAssignEntry_Transparent
          | undefined;
      };
    }
  | {
      assignType: 'dual';
      settings: {
        type: 'dual';
        useShiftCancel: boolean;
        primaryDefaultTrigger: 'down' | 'tap';
        useInterruptHold: boolean;
        tapHoldThresholdMs: number;
      };
      assigns: {
        // laX.kuY
        [address: string]:
          | IAssignEntry_Dual
          | IAssingEntry_Block
          | IAssignEntry_Transparent
          | undefined;
      };
    }
);
*/

export type IProfileData = {
  revision: 'PRF03';
  projectId: string;
  keyboardDesign: IPersistKeyboardDesign;
  layers: ILayer[];
  settings:
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
  assigns: {
    // laX.kuY
    [address: string]:
      | IAssignEntry_Single
      | IAssignEntry_Dual
      | IAssingEntry_Block
      | IAssignEntry_Transparent
      | undefined;
  };
};

export type IProfileDataAssigns = {
  [address: string]:
    | IAssignEntry_Single
    | IAssignEntry_Dual
    | IAssingEntry_Block
    | IAssignEntry_Transparent
    | undefined;
};

export const fallbackProfileData: IProfileData = {
  revision: 'PRF03',
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
};
