import {
  IModelKeyAssignsProvider,
  LayerState,
  LogicalKeyAction
} from './Types';
import { IKeyAssignEntry } from '~contract/data';
import { KeyAssignToLogicalKeyActionResolver } from './KeyAssignToLogicalKeyActionResolver';
import { LogicalKeyActionDriver } from './LogicalKeyActionDriver';
import { coloredLog } from '~shell/ColoredLog';

interface IGateEvent {
  trigger: 'D' | 'U' | 'R';
  keyId: string;
  systemTickMs: number;
}

export namespace VirtualKeyStateManager2 {
  const local = new (class {
    // events: string = '';
    resolving: boolean = false;
    keyAssignsProvider: IModelKeyAssignsProvider = {
      keyUnitIdTable: [],
      keyAssigns: {}
    };
    boundLogicalKeyActions: {
      [keyId: string]: LogicalKeyAction;
    } = {};
    recallTask?: {
      keyId: string;
      downTick: number;
    };
    gateEvents: IGateEvent[] = [];
  })();

  const layerState: LayerState = {
    holdLayerId: '',
    modalLayerId: '',
    oneshotLayerId: '',
    oneshotModifierKeyCode: undefined
  };

  function resolveStart() {
    coloredLog('<<start resolver>>', 'cyan');
    local.resolving = true;
    // local.events = '';
    local.gateEvents = [];
  }

  function resolveCompleted() {
    local.resolving = false;
    local.recallTask = undefined;
  }

  // function pushEvent(event: 'D' | 'U' | 'K') {
  //   local.events += event;
  //   // local.ticks.push(local.upTick);
  //   // console.log(local.events, local.ticks);
  //   if (local.events === 'DU') {
  //     emitTrigger('tap');
  //   }
  //   if (local.events === 'DK') {
  //     emitTrigger('hold');
  //     resolveCompleted();
  //   }
  //   if (local.events === 'DUK') {
  //     emitTrigger('dt-singletap');
  //     resolveCompleted();
  //   }
  //   if (local.events === 'DUDK' || local.events === 'DUDUK') {
  //     emitTrigger('dt-doubletap');
  //     resolveCompleted();
  //   }
  //   if (local.events === 'DUDUDK' || local.events === 'DUDUDU') {
  //     emitTrigger('dt-tripletap');
  //     resolveCompleted();
  //   }
  // }

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

  function getTargetLayerId(state: LayerState) {
    return (
      state.oneshotLayerId || state.holdLayerId || state.modalLayerId || 'la0'
    );
  }

  function resolveAssign(
    keyId: string,
    assign: IKeyAssignEntry,
    trigger: 'down' | 'tap' | 'hold'
  ) {
    const action = KeyAssignToLogicalKeyActionResolver.mapKeyAssignEntryToLogicalKeyAction(
      assign
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
    }
  }

  function dumpGateEvents() {
    console.log(local.gateEvents);
  }

  function tryToResolveEvent(keyId: string, trigger: 'D' | 'U' | 'R') {
    local.gateEvents.push({
      keyId,
      trigger,
      systemTickMs: 0
    });
    console.log(`try to resolve ${keyId} ${trigger}`);

    dumpGateEvents();

    const { keyAssigns } = local.keyAssignsProvider;

    // const triggers = local.gateEvents.map(ge => ge.trigger).join('');
    // const allSameKeys = local.gateEvents.map(ge => ge.keyIndex)
    // console.log(triggers);

    const targetLayerId = getTargetLayerId(layerState);

    const primary = keyAssigns[`${keyId}.${targetLayerId}.pri`];
    const secondary = keyAssigns[`${keyId}.${targetLayerId}.sec`];

    if (trigger === 'D') {
      if (secondary) {
        //reserveRecall(keyIndex, 60);
        reserveRecall(keyId, 200); //debug
      } else if (primary) {
        resolveAssign(keyId, primary, 'down');
      }
    } else if (trigger === 'U') {
      if (primary) {
        resolveAssign(keyId, primary, 'tap');
      }
    } else if (trigger === 'R') {
      if (secondary) {
        resolveAssign(keyId, secondary, 'hold');
      }
    }
  }

  function handleHardwareKeyStateEvent2(keyId: string, isDown: boolean) {
    if (!isDown) {
      const done = handleOffAssignAction(keyId);
      if (done) {
        return;
      }
    }

    if (isDown && local.recallTask && keyId !== local.recallTask.keyId) {
      tryToResolveEvent(local.recallTask.keyId, 'R');
    }

    if (isDown && !local.resolving) {
      resolveStart();
    }

    tryToResolveEvent(keyId, isDown ? 'D' : 'U');
  }

  function reserveRecall(keyId: string, downTick: number) {
    local.recallTask = {
      keyId,
      downTick
    };
  }

  function onRecallTick() {
    if (local.recallTask) {
      const task = local.recallTask;
      if (task.downTick > 0) {
        task.downTick--;
        if (task.downTick === 0) {
          tryToResolveEvent(task.keyId, 'R');
        }
      }
    }
  }

  export function handleHardwareKeyStateEvent(
    keyIndex: number,
    isDown: boolean,
    keyAssignsProvider: IModelKeyAssignsProvider
  ) {
    local.keyAssignsProvider = keyAssignsProvider;
    const keyId = keyAssignsProvider.keyUnitIdTable[keyIndex];
    if (keyId) {
      handleHardwareKeyStateEvent2(keyId, isDown);
    }
  }

  export function start() {
    setInterval(onRecallTick, 1);
  }
}
