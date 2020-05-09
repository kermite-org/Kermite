import {
  IAssignOperation,
  IAssignEntry,
  IAssignEntry_Single,
  IAssignEntry_Dual
} from '~defs/ProfileData';
import {
  logicSimulatorCConfig,
  logicSimulatorStateC
} from './LogicSimulatorCCommon';
import {
  ModuleF_KeyEventPrioritySorter,
  IKeyStrokeAssignEvent
} from './ModuleF_KeyEventPrioritySorter';
import { ModuleK_KeyStrokeAssignDispatcher } from './ModuleK_KeyStrokeAssignDispatcher';

//down-tap-up
//down-hold-up
type IKeyTrigger = 'down' | 'tap' | 'hold' | 'up';

interface IKeyTriggerEvent {
  keyId: string;
  trigger: IKeyTrigger;
}

export namespace ModuleD_KeyInputAssignReader {
  function getAssign(
    keyId: string,
    targetType: 'single' | 'dual'
  ): IAssignEntry | undefined {
    const { layers, assigns } = logicSimulatorStateC.profileData;
    const { holdLayerIds } = logicSimulatorStateC;
    const activeLayers = layers
      .filter((la) => holdLayerIds.has(la.layerId))
      .reverse();
    for (const la of activeLayers) {
      const assign = assigns[`${la.layerId}.${keyId}`];
      if (!assign && la.defaultScheme === 'block') {
        return undefined;
      }
      if (assign && assign.type === targetType) {
        return assign;
      }
    }
    return undefined;
  }

  function pushStrokeEvent(ev: IKeyStrokeAssignEvent) {
    if (!logicSimulatorCConfig.usePrioritySorter) {
      ModuleK_KeyStrokeAssignDispatcher.handleLogicalStroke(ev);
    } else {
      ModuleF_KeyEventPrioritySorter.pushStrokeAssignEvent(ev);
    }
  }

  function getPriorityVirtualKey(assign: IAssignOperation) {
    if (assign.type === 'layerCall') {
      return 'PK_SortOrder_Forward';
    }
    if (assign.type === 'keyInput' && assign.virtualKey) {
      return assign.virtualKey;
    }
    return 'PK_SortOrder_Backward';
  }

  const local = new (class {
    holdKeyIdSet: Set<string> = new Set();
  })();

  function pushStrokeDown(keyId: string, assign: IAssignOperation) {
    const { holdKeyIdSet } = local;
    const priorityVirtualKey = getPriorityVirtualKey(assign);
    pushStrokeEvent({
      type: 'down',
      keyId,
      assign,
      priorityVirtualKey,
      tick: Date.now()
    });
    holdKeyIdSet.add(keyId);
  }

  function pushStrokeUp(keyId: string) {
    const { holdKeyIdSet } = local;
    if (holdKeyIdSet.has(keyId)) {
      pushStrokeEvent({
        type: 'up',
        keyId,
        priorityVirtualKey: 'PK_SortOrder_Backward',
        tick: Date.now()
      });
      holdKeyIdSet.delete(keyId);
    }
  }

  function processEvent_Signle(ev: IKeyTriggerEvent) {
    const { keyId, trigger } = ev;
    if (trigger === 'down') {
      const assign = getAssign(keyId, 'single') as
        | IAssignEntry_Single
        | undefined;
      if (assign?.op) {
        pushStrokeDown(keyId, assign.op);
      }
    }
    if (trigger === 'up') {
      pushStrokeUp(keyId);
    }
  }

  function processEvent_Dual(ev: IKeyTriggerEvent) {
    const { keyId, trigger } = ev;

    const assign = getAssign(keyId, 'dual') as IAssignEntry_Dual | undefined;
    if (assign) {
      const pri = assign?.primaryOp;
      const sec = assign?.secondaryOp;

      if (0) {
        //tap-primary-hold-secondary
        if (pri && sec) {
          if (trigger === 'tap') {
            pushStrokeDown(keyId, pri);
          }
          if (trigger === 'hold') {
            pushStrokeDown(keyId, sec);
          }
        } else if (pri && !sec) {
          if (trigger === 'down') {
            pushStrokeDown(keyId, pri);
          }
        } else if (!pri && sec) {
          if (trigger === 'down') {
            pushStrokeDown(keyId, sec);
          }
        }
      } else {
        //down-secondary-tap-primary
        if (pri && sec) {
          if (trigger === 'down') {
            pushStrokeDown(keyId, sec);
          }
          if (trigger === 'tap') {
            pushStrokeUp(keyId);
            pushStrokeDown(keyId, pri);
          }
        } else if (pri && !sec) {
          if (trigger === 'down') {
            pushStrokeDown(keyId, pri);
          }
        } else if (!pri && sec) {
          if (trigger === 'down') {
            pushStrokeDown(keyId, sec);
          }
        }
      }

      if (trigger === 'up') {
        pushStrokeUp(keyId);
      }
    }
  }

  export function processEvent(ev: IKeyTriggerEvent) {
    const assignType = logicSimulatorStateC.profileData.assignType;
    if (assignType === 'single') {
      processEvent_Signle(ev);
    }
    if (assignType === 'dual') {
      processEvent_Dual(ev);
    }
  }
}
