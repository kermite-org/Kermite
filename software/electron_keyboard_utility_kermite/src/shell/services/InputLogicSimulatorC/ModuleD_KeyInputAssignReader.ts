import { IAssignEntry, IAssignOperation } from '~defs/ProfileData';
import {
  IKeyTrigger,
  logicSimulatorCConfig,
  logicSimulatorStateC
} from './LogicSimulatorCCommon';
import {
  IKeyStrokeAssignEvent,
  ModuleF_KeyEventPrioritySorter
} from './ModuleF_KeyEventPrioritySorter';
import { ModuleK_KeyStrokeAssignDispatcher } from './ModuleK_KeyStrokeAssignDispatcher';

interface IKeyTriggerEvent {
  keyId: string;
  trigger: IKeyTrigger;
}

export namespace ModuleD_KeyInputAssignReader {
  export function getAssign(
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

  function getPriorityVirtualKey(op: IAssignOperation) {
    if (op.type === 'layerCall') {
      return 'PK_SortOrder_Forward';
    }
    if (op.type === 'keyInput' && op.virtualKey) {
      return op.virtualKey;
    }
    return 'PK_SortOrder_Backward';
  }

  const local = new (class {
    holdKeyIdSet: Set<string> = new Set();
  })();

  function pushStrokeDown(
    keyId: string,
    op: IAssignOperation,
    trigger: IKeyTrigger
  ) {
    const { holdKeyIdSet } = local;
    const priorityVirtualKey = getPriorityVirtualKey(op);
    pushStrokeEvent({
      type: 'down',
      keyId,
      trigger,
      op,
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

  export function getAssignOperation(
    keyId: string,
    trigger: IKeyTrigger,
    targetType: 'single' | 'dual'
  ): IAssignOperation | undefined {
    const assign = getAssign(keyId, targetType);
    if (targetType === 'single' && assign?.type === 'single') {
      if (trigger === 'down') {
        return assign.op;
      }
    }
    if (targetType === 'dual' && assign?.type === 'dual') {
      const pri = assign?.primaryOp;
      const sec = assign?.secondaryOp;
      //tap-primary-hold-secondary
      if (pri && sec) {
        if (trigger === 'tap') {
          return pri;
        }
        if (trigger === 'hold') {
          return sec;
        }
      } else if (pri && !sec) {
        if (trigger === 'down') {
          return pri;
        }
      } else if (!pri && sec) {
        if (trigger === 'down') {
          return sec;
        }
      }
    }
    return undefined;
  }

  export function processEvent(ev: IKeyTriggerEvent) {
    const assignType = logicSimulatorStateC.profileData.assignType;
    const { keyId, trigger } = ev;
    if (trigger === 'down' || trigger === 'tap' || trigger === 'hold') {
      const op = getAssignOperation(keyId, trigger, assignType);
      if (op) {
        pushStrokeDown(keyId, op, trigger);
      }
    }
    if (trigger === 'up') {
      pushStrokeUp(keyId);
    }
  }
}
