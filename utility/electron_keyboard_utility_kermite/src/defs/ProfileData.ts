import { ModifierVirtualKey, VirtualKey } from './VirtualKeys';

// import { VirtualKey, ModifierVirtualKey } from './VirtualKey';

export interface ILayer {
  layerId: string;
  layerName: string;
  // layerRole: 'root' | 'main' | 'custom';
  // attachedModifiers?: ModifierVirtualKey[];
  isShiftLayer?: boolean;
}

export type IHoldFunctionInvocationMode =
  | 'hold'
  | 'oneshot'
  | 'modal'
  | 'unmodal';

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
  //invocationMode: HoldFunctionInvocationMode;
  // | {
  //     type: 'none';
  //   }
  // |
  | undefined
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

export type IAssignOperationTypeMap = {
  // none: IAssingOperationNone | undefined;
  none: undefined;
  keyInput: IAssingOperationKeyInput;
  layerCall: IAssignOperationLayerCall;
  modifierCall: IAssignOperationModifierCall;
};

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

export type ISingleAssignEntryType = 'none' | 'single';
// | 'transparent'
// | 'single1'
// | 'single2';
// | 'singleVersatile1';

// export type ISingleAssignEntry_None = {
//   type: 'none';
// };
export type ISingleAssignEntry_Transparent = {
  type: 'transparent';
};
export type ISingleAssignEntry_Single = {
  type: 'single';
  op?: IAssignOperation;
};

// export type ISingleAssignEntry_Single2_Mode = 'single' | 'dual';
export type ISingleAssignEntry_Single2 = {
  type: 'single2';
  // mode: 'single' | 'dual';
  mode: 'dual';
  primaryOp?: IAssignOperation; //down, tap(if secondaryOp exists)
  secondaryOp?: IAssignOperation; //hold
};
// export type ISingleAssignEntry_SingleVersatile1 = {
//   type: 'singleVersatile1';
//   slots: {
//     trigger: IInputTriggersA;
//     op: IAssignOperation;
//     cancelPreviousInput?: boolean;
//   }[];
// };
export type ISingleAssignEntry = undefined | ISingleAssignEntry_Single;
// | ISingleAssignEntry_None
// | ISingleAssignEntry_Transparent
// | ISingleAssignEntry_Single2;
// | ISingleAssignEntry_SingleVersatile1;

export type ISingleAssignEntryTypeMap = {
  // none: ISingleAssignEntry_None | undefined;
  none: undefined;
  single: ISingleAssignEntry_Single;
  // transparent: ISingleAssignEntry_Transparent;
  // single1: ISingleAssignEntry_Single1;
  // single2: ISingleAssignEntry_Single2;
  // singleVersatile1: ISingleAssignEntry_SingleVersatile1;
};

export type ICombinationAssignEntry =
  | {
      type: 'combination1';
      keyIds: string[];
      op: IAssignOperation;
      // combinationMode: MultiSourceKeyAssignMode;
    }
  | {
      type: 'sequence1';
      keyIds: string[];
      op: IAssignOperation;
    };

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

export interface IKeyUnitPositionEntry {
  id: string;
  x: number;
  y: number;
  r: number;
  pk: number;
}

export interface IKeyboardShape {
  bleedName: string;
  keyPositions: IKeyUnitPositionEntry[];
  bodyPathMarkupText: string;
}

export const keyboardShape_fallbackData: IKeyboardShape = {
  bleedName: 'none',
  keyPositions: [],
  bodyPathMarkupText: ''
};

export interface IProfileData {
  revision: 'PRF02';
  // keyboardBreedName: string;
  keyboardShape: IKeyboardShape;
  /*
    featureLevel controls which assign features are enabled (& displayed in UI)
    0 single1
    1 single1, signle2
    2 single1, single2, singleVersatile1
    3 single1, single2, singleVersatile1, combinations
    */
  // featureLevel: 0 | 1 | 2 | 3;
  /*
    strong fallback layer is checked after when there aren't any assigns found
    */
  strongFallbackLayerId?: string;
  layers: ILayer[];
  assigns: {
    //laX.kuY
    [address: string]: ISingleAssignEntry | undefined;
    // [layerId: string]: {
    //   [keyId: string]: ISingleAssignEntry;
    // };
  };
  // multiAssigns?: {
  //   [layerId: string]: ICombinationAssignEntry[];
  // };
}

export const fallbackProfileData: IProfileData = {
  revision: 'PRF02',
  // featureLevel: 3,
  keyboardShape: keyboardShape_fallbackData,
  layers: [
    {
      layerId: 'la0',
      layerName: 'main'
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

//glue definitions for model migration
export type IKeyAssignEntry = NonNullable<IAssignOperation>;
export type IEditModel = IProfileData;
