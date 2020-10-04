import { ModifierVirtualKey, VirtualKey } from './VirtualKeys';

export type ILayerDefaultScheme = 'block' | 'transparent';
export interface ILayer {
  layerId: string;
  layerName: string;
  // layerRole: 'root' | 'main' | 'custom';
  // attachedModifiers?: ModifierVirtualKey[];
  isShiftLayer?: boolean;
  defaultScheme: ILayerDefaultScheme;
}

export type IHoldFunctionInvocationMode =
  | 'hold'
  | 'turnOn'
  | 'turnOff'
  | 'toggle'
  | 'base'
  | 'oneshot';

export type IAssignOperationType =
  | 'none'
  | 'keyInput'
  | 'layerCall'
  | 'modifierCall';

// export type IAssingOperationNone = {
//   type: 'none';
// };
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

export type IAssignOperation =
  // invocationMode: HoldFunctionInvocationMode;
  // | {
  //     type: 'none';
  //   }
  // |
  // | undefined
  // | IAssingOperationNone
  | IAssingOperationKeyInput
  | IAssignOperationLayerCall
  | IAssignOperationModifierCall;

// | {
//     type: 'repeatedKeyInput';
//     key: VirtualKey;
//     intervalMs: number;
//   }
// | {
//     type: 'fixedText';
//     text: string;
//   }
// | {
//     type: 'sequenceMacro';
//   }
// | {
//     type: 'mouseGesture';
//   }
// | {
//     type: 'mouseOperation';
//     action: 'leftdown' | 'leftup' | 'leftclick';
//   };

// export type InputTrigger =
//   | 'down'
//   | 'downLazy'
//   | 'tap'
//   | 'hold'
//   | 'doubleTap'
//   | 'up';

// export type IAssignOperationTypeMap = {
//   // none: IAssingOperationNone | undefined;
//   none: undefined;
//   keyInput: IAssingOperationKeyInput;
//   layerCall: IAssignOperationLayerCall;
//   modifierCall: IAssignOperationModifierCall;
// };

// export type IInputTriggersA =
//   | 'down'
//   | 'down_w'
//   | 'up'
//   | 'up_w'
//   | 'tap'
//   | 'tap_w'
//   | 'tap_redown'
//   | 'tap_rehold'
//   | 'hold'
//   | 'dtap'
//   | 'dtap_w'
//   | 'tritap'
//   | 'tap_dtap'
//   | 'tap_dtap_tritap'
//   | 'tap_drill_d'
//   | 'tap_drill_dd'
//   | 'tap_drill_ddd';

export type IProfileAssignType = 'single' | 'dual';

export type IAssignEntryType = 'none' | 'single' | 'dual';
// | 'transparent'
// | 'single1'
// | 'single2';
// | 'singleVersatile1';

// export type ISingleAssignEntry_None = {
//   type: 'none';
// };
// export type IAssignEntry_Transparent = {
//   type: 'transparent';
// };
export type IAssignEntry_Single = {
  type: 'single';
  op?: IAssignOperation;
};

// export type ISingleAssignEntry_Single2_Mode = 'single' | 'dual';
export type IAssignEntry_Dual = {
  type: 'dual';
  // mode: 'single' | 'dual';
  // mode: 'dual';
  primaryOp?: IAssignOperation; // down, tap(if secondaryOp exists)
  secondaryOp?: IAssignOperation; // hold
  tertiaryOp?: IAssignOperation; // double-tap
};
// export type ISingleAssignEntry_SingleVersatile1 = {
//   type: 'singleVersatile1';
//   slots: {
//     trigger: IInputTriggersA;
//     op: IAssignOperation;
//     cancelPreviousInput?: boolean;
//   }[];
// };
export type IAssignEntry = IAssignEntry_Single | IAssignEntry_Dual;
// | ISingleAssignEntry_None
// | ISingleAssignEntry_Transparent
// | ISingleAssignEntry_Single2;
// | ISingleAssignEntry_SingleVersatile1;

// export type IAssignEntryTypeMap = {
//   // none: ISingleAssignEntry_None | undefined;
//   none: undefined;
//   single: IAssignEntry_Single;
//   double: IAssignEntry_Dual;
//   // transparent: ISingleAssignEntry_Transparent;
//   // single1: ISingleAssignEntry_Single1;
//   // single2: ISingleAssignEntry_Single2;
//   // singleVersatile1: ISingleAssignEntry_SingleVersatile1;
// };

// export type ICombinationAssignEntry =
//   | {
//       type: 'combination1';
//       keyIds: string[];
//       op: IAssignOperation;
//       // combinationMode: MultiSourceKeyAssignMode;
//     }
//   | {
//       type: 'sequence1';
//       keyIds: string[];
//       op: IAssignOperation;
//     };

// export type ISingleKeyAssignsDict = {
//   [keyId: string]: ISingleAssignEntry;
// };

// export type IKeyAssignsSet = {
//   [layerId: string]: {
//     //assigns for single key
//     singles: ISingleKeyAssignsDict;
//     //assigns for key combination
//     combinations?: ICombinationAssignEntry[];
//   };
// };

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
  /*
    strong fallback layer is checked after when there aren't any assigns found
    */
  strongFallbackLayerId?: string;
  layers: ILayer[];
  // multiAssigns?: {
  //   [layerId: string]: ICombinationAssignEntry[];
  // };
} & (
  | {
      assignType: 'single';
      settings: {};
      assigns: {
        // laX.kuY
        [address: string]: IAssignEntry_Single | undefined;
      };
    }
  | {
      assignType: 'dual';
      settings: {
        type: 'dual';
        primaryDefaultTrigger: 'down' | 'tap';
        useInterruptHold: boolean;
        tapHoldThresholdMs: number;
      };
      assigns: {
        // laX.kuY
        [address: string]: IAssignEntry_Dual | undefined;
      };
    }
);

export const fallbackProfileData: IProfileData = {
  revision: 'PRF02',
  // featureLevel: 3,
  keyboardShape: keyboardShape_fallbackData,
  assignType: 'single',
  settings: {},
  layers: [
    {
      layerId: 'la0',
      layerName: 'main',
      defaultScheme: 'block'
      // layerRole: 'main'
    }
    // {
    //   layerId: 'la1',
    //   // layerRole: 'shift',
    //   layerName: 'shift'
    // }
  ],
  assigns: {}
};
