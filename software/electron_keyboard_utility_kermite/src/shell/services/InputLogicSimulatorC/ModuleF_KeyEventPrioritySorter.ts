import { IKeyAssignEntry } from '~defs/ProfileData';
import { VirtualKey } from '~defs/VirtualKeys';
import { logicSimulatorStateC } from './LogicSimulatorStateC';
import { ModuleP_OutputKeyStateCombiner } from './ModuleP_OutputKeyStateCombiner';

export namespace ModuleF_KeyEventPrioritySorter {
  type CommitEventType =
    | {
        type: 'down';
        keyId: string;
        assign: IKeyAssignEntry;
        priorityVirtualKey: VirtualKey;
        tick: number;
      }
    | {
        type: 'up';
        keyId: string;
        priorityVirtualKey: VirtualKey;
        tick: number;
      };

  const configs = {
    bypass: false,
    waitTimeMs: 100
  };
  // configs.bypass = true;

  const virtualKeyPriorityOrders: VirtualKey[] = [
    'K_Ctrl',
    'K_Alt',
    'K_OS',
    'K_Shift',

    'K_B',
    'K_C',
    'K_D',
    'K_F',
    'K_G',
    'K_J',
    'K_K',
    'K_M',
    'K_N',
    'K_P',
    'K_Q',
    'K_R',
    'K_S',
    'K_T',
    'K_V',
    'K_W',
    'K_X',
    'K_Z',

    'K_L',
    'K_H',
    'K_Y',

    'K_E',
    'K_A',
    'K_O',
    'K_I',
    'K_U',

    'K_Minus',
    'K_NONE'
  ];

  const local = new (class {
    holdCount: number = 0;
    commitEventQueue: CommitEventType[] = [];
  })();

  function isShiftLayer(targetLayerId: string) {
    const layer = logicSimulatorStateC.editModel.layers.find(
      (la) => la.layerId === targetLayerId
    );
    return layer?.layerName.includes('shift');
  }

  function handleCommitEvent(ev: CommitEventType) {
    const { keyBindingInfoDict } = logicSimulatorStateC;
    if (ev.type === 'down') {
      const { keyId, assign } = ev;
      console.log('down', ev.keyId, assign);
      keyBindingInfoDict[keyId] = { assign, timeStamp: Date.now() };
      if (assign.type === 'keyInput') {
        ModuleP_OutputKeyStateCombiner.pushHoldKeyBind(
          keyId,
          assign.virtualKey,
          assign.attachedModifiers || []
        );
      } else if (assign.type === 'layerCall') {
        if (isShiftLayer(assign.targetLayerId)) {
          ModuleP_OutputKeyStateCombiner.pushHoldKeyBind(keyId, 'K_Shift', []);
        }
      }
    } else {
      const { keyId } = ev;
      // console.log('up', ev.keyId);
      ModuleP_OutputKeyStateCombiner.removeHoldKeyBind(keyId);
      delete keyBindingInfoDict[keyId];
    }
  }

  export function pushCommitEvent(ev: CommitEventType) {
    if (configs.bypass) {
      handleCommitEvent(ev);
      return;
    }
    local.commitEventQueue.push(ev);
    if (ev.type === 'down') {
      local.holdCount++;
    } else {
      local.holdCount--;
    }
  }

  export function readQueuedEvents(): boolean {
    const { commitEventQueue: queue, holdCount } = local;
    if (queue.length > 0) {
      const latest = queue[queue.length - 1];
      const curTick = Date.now();
      if (curTick > latest.tick + configs.waitTimeMs || holdCount === 0) {
        queue.sort(
          (a, b) =>
            virtualKeyPriorityOrders.indexOf(a.priorityVirtualKey) -
            virtualKeyPriorityOrders.indexOf(b.priorityVirtualKey)
        );
        const ev = queue.shift()!;
        handleCommitEvent(ev);
        return true;
      }
    }
    return false;
  }
}
