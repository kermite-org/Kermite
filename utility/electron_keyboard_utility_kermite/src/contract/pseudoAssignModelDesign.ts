namespace NsPseudoAssignModelDesign {
  type VirtualKey = string;
  type ModifierVirtualKey = string;

  // type InputTrigger = 'down' | 'downLazy' | 'tap' | 'hold' | 'doubleTap' | 'up';

  type HoldFunctionInvocationMode = 'hold' | 'oneshot' | 'modal' | 'unmodal';

  // type MultiSourceKeyAssignMode =
  //   | 'groupDown'
  //   | 'groupTap'
  //   | 'combinationDown'
  //   | 'combinationUp'
  //   | 'sequenceDown'
  //   | 'sequenceUp'
  //   | 'sequencePress';

  type IKeyInputOperation =
    | {
        type: 'keyInput';
        virtualKey: VirtualKey;
        attachedModifiers?: ModifierVirtualKey[];
        immediateRelease?: boolean;
      }
    | {
        type: 'layerCall';
        targetLayerId: string;
        invocationMode: HoldFunctionInvocationMode;
      }
    | {
        type: 'modifierCall';
        modifierKey: ModifierVirtualKey;
        isOneShot: boolean;
        //invocationMode: HoldFunctionInvocationMode;
      }
    | {
        type: 'repeatedKeyInput';
        key: VirtualKey;
        intervalMs: number;
      }
    | {
        type: 'fixedText';
        text: string;
      }
    | {
        type: 'sequenceMacro';
      }
    | {
        type: 'mouseGesture';
      }
    | {
        type: 'mouseOperation';
        action: 'leftdown' | 'leftup' | 'leftclick';
      };

  // type ISingleAssignEntry = {
  //   trigger: InputTrigger;
  //   operation: IKeyInputOperation;
  // };
  // type ICombinationAssignEntry = {
  //   mode: MultiSourceKeyAssignMode;
  //   souceKeyIds: string[];
  //   operation: IKeyInputOperation;
  // };
  // type IKeyAssignEntry =
  //   | {
  //       type: 'single';
  //     }
  //   | {
  //       type: 'combination';

  //     };

  // interface ProfileModel {
  //   layers: any[];
  //   assigns: {
  //     [layerId: string]: {
  //       singles: {
  //         [keyId: string]: ISingleAssignEntry[];
  //       };
  //       combinations: ICombinationAssignEntry[];
  //     };
  //   };
  //   // assign: { [address: string]: IKeyAssignEntry };
  //   // extraAssigns: IMultiSourceKeyAssign[];
  // }

  // type IAssignSource =
  //   | {
  //       type: 'single';
  //       keyId: string;
  //       trigger: InputTrigger;
  //     }
  //   | {};

  // type IKeyAssignEntryA = {
  //   layerId: string;
  // };

  // interface IProfileModel {
  //   useRootLayer: boolean;
  //   assigns: IKeyAssignEntryA[];
  //   // assigns1?: {
  //   //   [layerId: string]: {
  //   //     singles: {
  //   //       [keyId: string]: ISingleAssignEntry[];
  //   //     };
  //   //     combinations?: ICombinationAssignEntry[];
  //   //   };
  //   // };
  // }

  // type TVersatileTriggers = 'D' | 'DU' | 'DUD' | ''

  type TInputTriggers_SignleVersatile1 =
    | 'down'
    | 'down_w'
    | 'up'
    | 'up_w'
    | 'tap'
    | 'tap_w'
    | 'tap_redown'
    | 'tap_rehold'
    | 'hold'
    | 'dtap'
    | 'dtap_w'
    | 'tritap'
    | 'tap_dtap'
    | 'tap_dtap_tritap'
    | 'tap_drill_d'
    | 'tap_drill_dd'
    | 'tap_drill_ddd';

  type ISingleAssignEntry =
    | {
        type: 'transparent';
      }
    | {
        type: 'single1';
        op: IKeyInputOperation;
      }
    | {
        type: 'single2';
        primaryOp: IKeyInputOperation; //down, tap(if secondaryOp exists)
        secondaryOp?: IKeyInputOperation; //hold
      }
    | {
        type: 'singleVersatile1';
        slots: {
          trigger: TInputTriggers_SignleVersatile1;
          op: IKeyInputOperation;
          cancelPreviousInput?: boolean;
        }[];
      };

  type ICombinationAssignEntry =
    | {
        type: 'combintaion1';
        keyIds: string[];
        op: IKeyInputOperation;
        // combinationMode: MultiSourceKeyAssignMode;
      }
    | {
        type: 'sequence1';
        keyIds: string[];
        op: IKeyInputOperation;
      };

  interface IProfileModel {
    /*
    featureLevel controls which assign features are enabled (& displayed in UI)
    0 single1
    1 single1, signle2
    2 single1, single2, singleVersatile1
    3 single1, single2, singleVersatile1, combinations
    */
    featureLevel: 0 | 1 | 2 | 3;
    /*
    strong fallback layer is checked after when there aren't any assigns found
    */
    strongFallbackLayerId?: string;
    layers: {
      layerId: string;
      layerName: string;
      // layerRole: 'root' | 'main' | 'custom';
      attachedModifiers?: ModifierVirtualKey[];
      //isShiftLayer?: boolean;
    }[];
    assigns: {
      [layerId: string]: {
        //assigns for single key
        singles: { [keyId: string]: ISingleAssignEntry };
        //assigns for key combination
        combinations?: ICombinationAssignEntry[];
      };
    };
  }
}
