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
  | 'base'
  | 'oneshot'
  | 'exclusive';

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

export type IAssignEntry_SingleEx =
  | IAssignEntry_Single
  | IAssingEntry_Block
  | IAssignEntry_Transparent;

export type IAssignEntry_DualEx =
  | IAssignEntry_Dual
  | IAssingEntry_Block
  | IAssignEntry_Transparent;

export interface IKeyUnitEntry {
  id: string;
  x: number;
  y: number;
  r?: number;
  keyIndex: number;
}

export interface IKeyboardShapeDisplayArea {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface IKeyboardShape {
  breedName: string;
  keyUnits: IKeyUnitEntry[];
  bodyPathMarkupText: string;
  displayArea: IKeyboardShapeDisplayArea;
}

export const keyboardShape_fallbackData: IKeyboardShape = {
  breedName: 'none',
  keyUnits: [],
  bodyPathMarkupText: '',
  displayArea: {
    centerX: 0,
    centerY: 0,
    width: 100,
    height: 100
  }
};

export type IProfileData = {
  revision: 'PRF02';
  // keyboardBreedName: string;
  keyboardShape: IKeyboardShape;
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

export const fallbackProfileData: IProfileData = {
  revision: 'PRF02',
  keyboardShape: keyboardShape_fallbackData,
  assignType: 'single',
  settings: {
    useShiftCancel: false
  },
  layers: [
    {
      layerId: 'la0',
      layerName: 'main',
      defaultScheme: 'block',
      exclusionGroup: 0,
      initialActive: true
    }
  ],
  assigns: {}
};
