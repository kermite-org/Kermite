import { sortOrderBy } from '~funcs/Utils';
import { VirtualKey } from '~defs/VirtualKeys';
import { IAssignOperation } from '~defs/ProfileData';
import { ModuleK_KeyStrokeAssignDispatcher } from './ModuleK_KeyStrokeAssignDispatcher';
import { IKeyTrigger } from './LogicSimulatorCCommon';

export type PriorityVirtualKey =
  | VirtualKey
  | 'PK_SortOrder_Forward'
  | 'PK_SortOrder_Backward';

export type IKeyStrokeAssignEvent =
  | {
      type: 'down';
      keyId: string;
      trigger: IKeyTrigger;
      op: IAssignOperation;
      priorityVirtualKey: PriorityVirtualKey;
      tick: number;
    }
  | {
      type: 'up';
      keyId: string;
      priorityVirtualKey: PriorityVirtualKey;
      tick: number;
    };

const virtualKeyPriorityOrders: PriorityVirtualKey[] = [
  'PK_SortOrder_Forward',
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

  'K_UU',
  'K_NN',
  'K_LTU',
  'K_Minus',
  'K_PostDouble',
  'K_NextDouble',
  'K_NONE',
  'PK_SortOrder_Forward'
];

const cfg = {
  inputSimultaneousKeysWaitTime: 60
};

export namespace ModuleF_KeyEventPrioritySorter {
  const local = new (class {
    holdCount: number = 0;
    inputQueue: IKeyStrokeAssignEvent[] = [];
    outputQueue: IKeyStrokeAssignEvent[] = [];
  })();

  function processInputQueue() {
    const { inputQueue, holdCount, outputQueue } = local;
    const curTick = Date.now();

    if (inputQueue.length > 0) {
      const downs = inputQueue.filter((ev) => ev.type === 'down');
      if (downs.length > 0) {
        const latest = downs[downs.length - 1];
        const timeOk =
          curTick > latest.tick + cfg.inputSimultaneousKeysWaitTime;
        if (timeOk || holdCount === 0) {
          inputQueue.sort(
            sortOrderBy(
              (a) =>
                (a.type === 'up' ? 1000 : 0) +
                virtualKeyPriorityOrders.indexOf(a.priorityVirtualKey)
            )
          );
          outputQueue.push(...inputQueue);
          local.inputQueue = [];
        }
      } else {
        outputQueue.push(...inputQueue);
        local.inputQueue = [];
      }
    }
  }

  export function pushStrokeAssignEvent(ev: IKeyStrokeAssignEvent) {
    local.inputQueue.push(ev);
    if (ev.type === 'down') {
      local.holdCount++;
    } else {
      local.holdCount--;
    }
  }

  function readQueuedEventOne(): IKeyStrokeAssignEvent | undefined {
    processInputQueue();
    return local.outputQueue.shift();
  }

  export function processTicker() {
    const ev = readQueuedEventOne();
    if (ev) {
      ModuleK_KeyStrokeAssignDispatcher.handleLogicalStroke(ev);
    }
  }
}
