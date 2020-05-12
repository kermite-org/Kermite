import { IAssignEntry, IAssignOperation } from '~defs/ProfileData';
import {
  createModuleIo,
  IKeyTrigger,
  logicSimulatorStateC,
  IKeyTriggerEvent,
  IKeyStrokeAssignEvent,
  logicSimulatorCConfig
} from './LogicSimulatorCCommon';

export namespace KeyInputAssignReaderCore {
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

  export function getPriorityVirtualKey(op: IAssignOperation) {
    if (op.type === 'layerCall') {
      return 'PK_SortOrder_Forward';
    }
    if (op.type === 'keyInput' && op.virtualKey) {
      return op.virtualKey;
    }
    return 'PK_SortOrder_Backward';
  }

  export function getAssignOperation(
    keyId: string,
    trigger: IKeyTrigger,
    targetType: 'single' | 'dual'
  ): IAssignOperation | undefined {
    const { profileData } = logicSimulatorStateC;
    const assign = getAssign(keyId, targetType);
    if (targetType === 'single' && assign?.type === 'single') {
      if (trigger === 'down') {
        return assign.op;
      }
    }
    if (
      targetType === 'dual' &&
      assign?.type === 'dual' &&
      profileData.assignType === 'dual'
    ) {
      const { primaryDefaultTrigger } = profileData.settings;
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
        if (trigger === primaryDefaultTrigger) {
          return pri;
        }
      } else if (!pri && sec) {
        if (trigger === primaryDefaultTrigger) {
          return sec;
        }
      }
    }
    return undefined;
  }
}

export namespace ModuleD_KeyInputAssignReader {
  export const io = createModuleIo<IKeyTriggerEvent, IKeyStrokeAssignEvent>(
    processEvent
  );

  const local = new (class {
    holdKeyIdSet: Set<string> = new Set();
  })();

  function pushStrokeDown(
    keyId: string,
    op: IAssignOperation,
    trigger: IKeyTrigger
  ) {
    const { holdKeyIdSet } = local;
    const priorityVirtualKey = KeyInputAssignReaderCore.getPriorityVirtualKey(
      op
    );
    io.emit({
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
      io.emit({
        type: 'up',
        keyId,
        priorityVirtualKey: 'PK_SortOrder_Backward',
        tick: Date.now()
      });
      holdKeyIdSet.delete(keyId);
    }
  }

  function processEvent(ev: IKeyTriggerEvent) {
    const assignType = logicSimulatorStateC.profileData.assignType;
    const { keyId, trigger } = ev;
    // console.log({ keyId, trigger });
    if (trigger === 'down' || trigger === 'tap' || trigger === 'hold') {
      const op = KeyInputAssignReaderCore.getAssignOperation(
        keyId,
        trigger,
        assignType
      );
      if (op) {
        pushStrokeDown(keyId, op, trigger);
      }
    }
    if (trigger === 'up') {
      pushStrokeUp(keyId);
    }
  }
}
