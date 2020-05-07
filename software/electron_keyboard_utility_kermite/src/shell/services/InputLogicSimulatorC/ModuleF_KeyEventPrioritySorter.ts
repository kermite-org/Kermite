import { VirtualKey } from '~defs/VirtualKeys';
import { IKeyStrokeAssignEvent } from './LogicSimulatorCCommon';
import { sortOrderBy } from '~funcs/Utils';

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

  'K_UU',
  'K_NN',
  'K_LTU',
  'K_Minus',
  'K_NextDouble',
  'K_NONE'
];

export namespace KeyEventPrioritySorter {
  const local = new (class {
    holdCount: number = 0;
    inputQueue: IKeyStrokeAssignEvent[] = [];
    outputQueue: IKeyStrokeAssignEvent[] = [];
  })();

  export function pushStrokeAssignEvent(ev: IKeyStrokeAssignEvent) {
    local.inputQueue.push(ev);
    if (ev.type === 'down') {
      local.holdCount++;
    } else {
      local.holdCount--;
    }
  }

  const cfg = {
    inputSimultaneousKeysWaitTime: 50
  };

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

  export function readQueuedEventOne(): IKeyStrokeAssignEvent | undefined {
    processInputQueue();
    return local.outputQueue.shift();
  }
}
