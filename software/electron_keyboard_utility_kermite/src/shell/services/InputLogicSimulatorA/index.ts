/* eslint-disable @typescript-eslint/no-use-before-define */
import { IRealtimeKeyboardEvent, IProfileManagerStatus } from '~defs/ipc';
import { Arrays } from '~funcs/Arrays';
import { createDictionaryFromKeyValues } from '~funcs/Utils';
import { appGlobal } from '../appGlobal';
import { coloredLog } from '~shell/ColoredLog';
import { LogicalKeyAction } from '../InputLogicSimulator/Types';
import { LogicalKeyActionDriver } from '../InputLogicSimulator/LogicalKeyActionDriver';
import { KeyAssignToLogicalKeyActionResolver } from '../InputLogicSimulator/KeyAssignToLogicalKeyActionResolver';
import { VirtualKey, ModifierVirtualKey } from '~defs/VirtualKeys';
import { LayerInvocationMode } from '~defs/ProfileData';

type InputTrigger = 'down' | 'downLazy' | 'tap' | 'hold' | 'doubleTap' | 'up';

//export type LayerInvocationMode = 'hold' | 'oneshot' | 'modal' | 'unmodal';

type MultiSourceKeyAssignMode =
  | 'groupDown'
  | 'groupTap'
  | 'combinationDown'
  | 'combinationUp'
  | 'sequenceDown'
  | 'sequenceUp'
  | 'sequencePress';

type IKeyInputOperation =
  | {
      type: 'keyInput';
      virtualKey: VirtualKey;
      modifiers?: ModifierVirtualKey[];
      immediateRelease?: boolean;
    }
  | {
      type: 'layerCall';
      targetLayerId: string;
      invocationMode: LayerInvocationMode;
    }
  | {
      type: 'modifierCall';
      modifierKey: ModifierVirtualKey;
      isOneShot: boolean;
    };
// | {
//     type: 'renda';
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
//   };

// type ISingleAssignEntry = {
//   trigger: InputTrigger;
//   operation: IKeyInputOperation;
// };
// type ICombinationAssignEntry = {
//   mode: MultiSourceKeyAssignMode;
//   souceKeyIds: string[];
//   operation: IKeyInputOperation;
// };

type IAssignSource =
  | {
      type: 'single';
      trigger: InputTrigger;
      keyId: string;
    }
  | {
      type: 'combination';
      keyIds: string[];
      combinationMode: MultiSourceKeyAssignMode;
    };

type IKeyAssignEntryA = {
  layerId: string;
  source: IAssignSource;
  operation: IKeyInputOperation;
};

interface IProfileModel {
  useRootLayer: boolean;
  assigns: IKeyAssignEntryA[];
  // assigns1?: {
  //   [layerId: string]: {
  //     singles: {
  //       [keyId: string]: ISingleAssignEntry[];
  //     };
  //     combinations?: ICombinationAssignEntry[];
  //   };
  // };
  layers: {
    layerId: string;
    layerName: string;
    layerRole: 'root' | 'main' | 'custom';
    isShiftLayer?: boolean;
  }[];
}

//la0.singles.ku0.slot0

const testBoard_profileModel: IProfileModel = {
  useRootLayer: true,
  assigns: [
    {
      layerId: 'la1',
      source: {
        type: 'single',
        keyId: 'ku11',
        trigger: 'down'
      },
      operation: {
        type: 'keyInput',
        virtualKey: 'K_A'
      }
    },
    {
      layerId: 'la1',
      source: {
        type: 'single',
        keyId: 'ku10',
        trigger: 'down'
      },
      operation: {
        type: 'keyInput',
        virtualKey: 'K_B'
      }
    },
    {
      layerId: 'la1',
      source: {
        type: 'single',
        keyId: 'ku9',
        trigger: 'tap'
      },
      operation: {
        type: 'keyInput',
        virtualKey: 'K_C'
      }
    },
    {
      layerId: 'la1',
      source: {
        type: 'single',
        keyId: 'ku9',
        trigger: 'hold'
      },
      operation: {
        type: 'keyInput',
        virtualKey: 'K_D'
      }
    }
  ],
  // assigns1: {
  //   la1: {
  //     singles: {
  //       ku11: [
  //         {
  //           trigger: 'down',
  //           operation: {
  //             type: 'keyInput',
  //             virtualKey: 'K_A'
  //           }
  //         }
  //       ],
  //       ku10: [
  //         {
  //           trigger: 'down',
  //           operation: {
  //             type: 'keyInput',
  //             virtualKey: 'K_B'
  //           }
  //         }
  //       ],
  //       ku9: [
  //         {
  //           trigger: 'tap',
  //           operation: {
  //             type: 'keyInput',
  //             virtualKey: 'K_C'
  //           }
  //         },
  //         {
  //           trigger: 'hold',
  //           operation: {
  //             type: 'keyInput',
  //             virtualKey: 'K_D'
  //           }
  //         }
  //       ],
  //       ku18: [
  //         {
  //           trigger: 'down',
  //           operation: {
  //             type: 'holdLayer',
  //             targetLayerId: 'la1',
  //             layerInvocationMode: 'hold'
  //           }
  //         }
  //       ]
  //     }
  //   }
  // },
  layers: [
    { layerId: 'la0', layerName: 'root', layerRole: 'root' },
    { layerId: 'la1', layerName: 'main', layerRole: 'main' },
    { layerId: 'la2', layerName: 'xshift', layerRole: 'custom' }
  ]
};
const testBoard_keyUnitIdTable = createDictionaryFromKeyValues(
  Arrays.iota(48).map((idx) => [idx, `ku${idx}`])
);

interface IModelKeyAssignsProvider {
  profileModel: IProfileModel;
  keyUnitIdTable: { [KeyIndex: number]: string };
}

//---------

type ITriggerDUR = 'D' | 'U' | 'R';

interface IGateEventA {
  trigger: ITriggerDUR;
  keyId: string;
  systemTickMs: number;
}

type ITryToResolveEventCoreProc = (
  keyId: string,
  trigger: ITriggerDUR,
  gateEvents: any
) =>
  | {
      code: 'resolveCompleted';
    }
  | {
      code: 'reserveRecall';
      recallTickMs: number;
    }
  | {
      code: 'notResolvedYet';
    };

function showResolveResult(
  keyId: string,
  trigger: InputTrigger,
  operation: IKeyInputOperation
) {
  console.log(`[resolved] ${keyId} ${trigger} ${JSON.stringify(operation)}`);
}

function findAssignEntry(
  profileModel: IProfileModel,
  layerId: string,
  keyId: string,
  trigger: InputTrigger
) {
  return profileModel.assigns.find((it) => {
    return (
      it.layerId === layerId &&
      it.source.type === 'single' &&
      it.source.keyId === keyId &&
      it.source.trigger === trigger
    );
  });
}

export interface LayerState {
  // currentLayerId: string;
  holdLayerId: string;
  modalLayerId: string;
  oneshotLayerId: string;
  oneshotModifierKeyCode: number | undefined;
}

namespace CoreLogicInterfaceNEXT {
  interface IDomainState {}
  interface IDomainInputEvent {
    // type: 'keyInput',
    keyId: string;
    trigger: ITriggerDUR;
  }

  interface IDomainSource {
    state: IDomainState;
    inputEvent: IDomainInputEvent;
  }

  type IDomainOutputRequest = {
    code: 'reserveRecall';
    recallTickMs: number;
  };

  interface IDomainSink {
    state: IDomainState;
    outputRequest: IDomainOutputRequest[];
  }

  interface IDomainLogic {
    (source: IDomainSource): IDomainSink;
  }
}

// namespace foo {
//   // export function setCoreProc(coreProc: ITryToResolveEventCoreProc) {
//   //   local2.coreProc = coreProc;
//   // }
//   // function dumpGateEvents() {
//   //   console.log(local.gateEvents);
//   // }
// }

//---------

namespace InputCoreLogic {
  const local = new (class {
    assingsProvider: IModelKeyAssignsProvider = {
      profileModel: {
        useRootLayer: false,
        assigns: [],
        layers: []
      },
      keyUnitIdTable: {}
    };
    boundLogicalKeyActions: {
      [keyId: string]: LogicalKeyAction;
    } = {};
    curLayerId: string = '';
    baseLayerId: string = '';
  })();

  // const local = new (class {
  //   keyAssignsProvider: IModelKeyAssignsProvider = {
  //     keyUnitIdTable: [],
  //     keyAssigns: {}
  //   };

  // })();

  const layerState: LayerState = {
    holdLayerId: '',
    modalLayerId: '',
    oneshotLayerId: '',
    oneshotModifierKeyCode: undefined
  };

  function handleOnAssignAction(keyId: string, action: LogicalKeyAction) {
    LogicalKeyActionDriver.commitLogicalKeyAction(layerState, action, true);
    local.boundLogicalKeyActions[keyId] = action;
  }

  function handleOffAssignAction(keyId: string): boolean {
    const action = local.boundLogicalKeyActions[keyId];
    if (action) {
      console.log(`[RELEASE] ${action.rcode}`);
      LogicalKeyActionDriver.commitLogicalKeyAction(layerState, action, false);
      delete local.boundLogicalKeyActions[keyId];
      return true;
    }
    return false;
  }

  function resolveAssign(
    keyId: string,
    assign: IKeyAssignEntryA,
    trigger: 'down' | 'tap' | 'hold'
  ): void {
    const action = KeyAssignToLogicalKeyActionResolver.mapKeyAssignEntryToLogicalKeyAction(
      assign.operation
    );
    if (action) {
      coloredLog(
        `  <<[RESOLVED] ${keyId} ${trigger} ${action.rcode}>>`,
        'cyan'
      );
      // console.log(`<<end resolver>>`);
      handleOnAssignAction(keyId, action);

      if (trigger === 'tap') {
        handleOffAssignAction(keyId);
      }
      resolveCompleted();
      // return { code: 'resolveCompleted' };
    }

    // return { code: 'notResolvedYet' };
  }

  function getTargetLayerId(state: LayerState) {
    return (
      state.oneshotLayerId || state.holdLayerId || state.modalLayerId || 'la1'
    );
  }

  // foo.setCoreProc(tryToResolveEventCore);

  function tryToResolveEventCore(
    keyId: string,
    trigger: 'D' | 'U' | 'R',
    gateEvents: any[]
  ): void {
    const {
      assingsProvider: { profileModel }
      // curLayerId
    } = local;

    // const { keyAssigns } = local.keyAssignsProvider;

    // const triggers = local.gateEvents.map(ge => ge.trigger).join('');
    // const allSameKeys = local.gateEvents.map(ge => ge.keyIndex)
    // console.log(triggers);

    const targetLayerId = getTargetLayerId(layerState);

    const downEntry = findAssignEntry(
      profileModel,
      targetLayerId,
      keyId,
      'down'
    );
    const tapEntry = findAssignEntry(profileModel, targetLayerId, keyId, 'tap');
    const holdEntry = findAssignEntry(
      profileModel,
      targetLayerId,
      keyId,
      'hold'
    );

    // if (trigger === 'D') {
    //   if (holdEntry) {
    //     return { code: 'reserveRecall', recallTickMs: 200 };
    //   } else if (downEntry) {
    //     showResolveResult(keyId, 'down', downEntry.operation);
    //   }
    // }else if

    // const primary = keyAssigns[`${keyId}.${targetLayerId}.pri`];
    // const secondary = keyAssigns[`${keyId}.${targetLayerId}.sec`];

    if (trigger === 'D') {
      if (holdEntry) {
        //reserveRecall(keyIndex, 60);
        reserveRecall(keyId, 200); //debug
        //return { code: 'reserveRecall', recallTickMs: 200 };
      } else if (downEntry) {
        return resolveAssign(keyId, downEntry, 'down');
      }
    } else if (trigger === 'U') {
      if (tapEntry) {
        return resolveAssign(keyId, tapEntry, 'tap');
      }
    } else if (trigger === 'R') {
      if (holdEntry) {
        return resolveAssign(keyId, holdEntry, 'hold');
      }
    }

    // return { code: 'notResolvedYet' };
  }

  // function handleHardwareKeyStateEvent(
  //   keyIndex: number,
  //   isDown: boolean,
  //   keyAssignsProvider: IModelKeyAssignsProvider
  // ) {
  //   local.keyAssignsProvider = keyAssignsProvider;
  //   const keyId = keyAssignsProvider.keyUnitIdTable[keyIndex];
  //   if (keyId) {
  //     foo.handleHardwareKeyStateEvent2(keyId, isDown);
  //   }
  // }

  const local2 = new (class {
    resolving: boolean = false;
    recallTask?: {
      keyId: string;
      downTick: number;
    };
    gateEvents: IGateEventA[] = [];
    // coreProc: ITryToResolveEventCoreProc | undefined = undefined;
  })();

  function resolveStart() {
    local2.resolving = true;
    local2.gateEvents = [];
  }
  function resolveCompleted() {
    local2.resolving = false;
    local2.recallTask = undefined;
  }

  export function tryToResolveEvent(event: {
    keyId: string;
    trigger: ITriggerDUR;
  }) {
    const { keyId, trigger } = event;

    local2.gateEvents.push({
      keyId,
      trigger,
      systemTickMs: 0
    });
    console.log(`try to resolve ${keyId} ${trigger}`);

    console.log(local2.gateEvents);

    tryToResolveEventCore(keyId, trigger, local2.gateEvents);

    // dumpGateEvents();
    // Nee.tryToResolveEventCore(keyId, trigger, local.gateEvents);

    // if (local2.coreProc) {
    // const res =
    // if (res.code === 'resolveCompleted') {
    //   resolveCompleted();
    // } else if (res.code === 'reserveRecall') {
    //   // reserveRecall(keyId, res.recallTickMs);
    // }
    // }
  }

  export function tryToResolveEventEntry(keyId: string, trigger: ITriggerDUR) {
    if (
      trigger === 'D' &&
      local2.recallTask &&
      keyId !== local2.recallTask.keyId
    ) {
      tryToResolveEvent({ keyId: local2.recallTask.keyId, trigger: 'R' });
    }

    if (trigger === 'D' && !local2.resolving) {
      coloredLog('<<start resolver>>', 'cyan');
      resolveStart();
    }

    tryToResolveEvent({ keyId, trigger });
  }

  // export function handleHardwareKeyStateEvent2(keyId: string, isDown: boolean) {
  //   tryToResolveEvent({ keyId, trigger: isDown ? 'D' : 'U' });
  // }

  //----------

  function handleHardwareKeyStateEventCore(keyId: string, isDown: boolean) {
    if (keyId) {
      if (!isDown) {
        const done = handleOffAssignAction(keyId);
        if (done) {
          return;
        }
      }
      tryToResolveEventEntry(keyId, isDown ? 'D' : 'U');
    }
  }

  function onRecallTick() {
    if (local2.recallTask) {
      const task = local2.recallTask;
      if (task.downTick > 0) {
        task.downTick--;
        if (task.downTick === 0) {
          tryToResolveEventEntry(task.keyId, 'R');
        }
      }
    }
  }

  function reserveRecall(keyId: string, downTick: number) {
    local2.recallTask = {
      keyId,
      downTick
    };
  }

  //----------
  //entry

  function start() {
    setInterval(onRecallTick, 1);
  }

  function setKeyAssignsProvider(assingsProvider: IModelKeyAssignsProvider) {
    local.assingsProvider = assingsProvider;
    local.baseLayerId = assingsProvider.profileModel.layers[1].layerId;
    local.curLayerId = local.baseLayerId;
  }

  function handleHardwareKeyStateEvent(keyIndex: number, isDown: boolean) {
    const keyId = local.assingsProvider.keyUnitIdTable[keyIndex];
    handleHardwareKeyStateEventCore(keyId, isDown);
  }

  export function getInterface() {
    return {
      start,
      setKeyAssignsProvider,
      handleHardwareKeyStateEvent
    };
  }
}

const inputCoreLogic = InputCoreLogic.getInterface();

export class InputLogicSimulatorA {
  private callApiKeyboardEvent = (ev: { keyCode: number; isDown: boolean }) => {
    const { keyCode, isDown } = ev;
    console.log(`    callApiKeyboardEvent __SIM__ ${keyCode} ${isDown}`);
    // callApiKeybdEventOriginal(keyCode, isDown);
    if (65 <= keyCode && keyCode < 68) {
      const scanCode = keyCode - 65 + 4;
      const report = [0, 0, isDown ? scanCode : 0, 0, 0, 0, 0, 0];
      appGlobal.deviceService.writeSideBrainHidReport(report);
    }
  };

  private onProfileManagerStatusChanged = (
    changedStatus: Partial<IProfileManagerStatus>
  ) => {
    if (changedStatus.loadedEditModel) {
    }
  };

  private onRealtimeKeyboardEvent = (event: IRealtimeKeyboardEvent) => {
    if (event.type === 'keyStateChanged') {
      const { keyIndex, isDown } = event;
      if (keyIndex === 12) {
        console.log('');
        return;
      }
      console.log(`key ${keyIndex} ${isDown ? 'down' : 'up'}`);

      inputCoreLogic.handleHardwareKeyStateEvent(keyIndex, isDown);
    }
    if (event.type === 'layerChanged') {
      console.log(`layer ${event.layerIndex}`);
    }
  };

  async initialize() {
    appGlobal.profileManager.subscribeStatus(
      this.onProfileManagerStatusChanged
    );
    appGlobal.deviceService.subscribe(this.onRealtimeKeyboardEvent);
    LogicalKeyActionDriver.setKeyDestinationProc(this.callApiKeyboardEvent);
    inputCoreLogic.start();

    inputCoreLogic.setKeyAssignsProvider({
      profileModel: testBoard_profileModel,
      keyUnitIdTable: testBoard_keyUnitIdTable
    });

    appGlobal.deviceService.setSideBrainMode(true);
  }

  async terminate() {
    appGlobal.deviceService.unsubscribe(this.onRealtimeKeyboardEvent);

    appGlobal.deviceService.setSideBrainMode(false);
  }
}
