import {
  IKeyAssignEntry,
  IAssignEntry,
  IAssignEntry_Single,
  IAssignEntry_Dual
} from '~defs/ProfileData';
import {
  IKeyStrokeAssignEvent,
  logicSimulatorCConfig,
  logicSimulatorStateC
} from './LogicSimulatorCCommon';
import { ModuleF_KeyEventPrioritySorter } from './ModuleF_KeyEventPrioritySorter';
import { ModuleK_KeyStrokeAssignGate } from './ModuleK_KeyStrokeAssignGate';

//down-tap-up
//down-hold-up
type ITrigger = 'down' | 'tap' | 'hold' | 'up';

interface IKeyTriggerEvent {
  keyId: string;
  trigger: ITrigger;
}

export namespace ModuleD_KeyInputAssignBinder {
  function getLayerHoldStates() {
    //todo: store layerHoldStates directly in logicSimulatorStateC
    const layerHoldStates: { [layerId: string]: boolean } = { la0: true };
    Object.values(logicSimulatorStateC.keyBindingInfoDict).forEach((bi) => {
      if (bi.assign.type === 'layerCall') {
        layerHoldStates[bi.assign.targetLayerId] = true;
      }
    });
    return layerHoldStates;
  }

  function getAssign(
    keyId: string,
    targetType: 'single' | 'dual'
  ): IAssignEntry {
    const { layers, assigns } = logicSimulatorStateC.editModel;
    const layerHoldStates = getLayerHoldStates();
    const activeLayers = layers
      .filter((la) => layerHoldStates[la.layerId])
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
      ModuleK_KeyStrokeAssignGate.handleLogicalStroke(ev);
    } else {
      ModuleF_KeyEventPrioritySorter.pushStrokeAssignEvent(ev);
    }
  }

  function getPriorityVirtualKey(assign: IKeyAssignEntry) {
    if (assign.type === 'layerCall') {
      return 'PK_SortOrder_Forward';
    }
    if (assign.type === 'keyInput' && assign.virtualKey) {
      return assign.virtualKey;
    }
    return 'PK_SortOrder_Backward';
  }

  const holdKeyIdSet: Set<string> = new Set();

  function pushStrokeDown(keyId: string, assign: IKeyAssignEntry) {
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

  function processEvents_Signle(ev: IKeyTriggerEvent) {
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

  function processEvents_Dual(ev: IKeyTriggerEvent) {
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

  export function processEvents(ev: IKeyTriggerEvent) {
    const assignType = logicSimulatorStateC.editModel.assignType;
    if (assignType === 'single') {
      processEvents_Signle(ev);
    }
    if (assignType === 'dual') {
      processEvents_Dual(ev);
    }
  }
}
