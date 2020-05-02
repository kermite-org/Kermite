import { VirtualKey } from '~defs/VirtualKeys';
import {
  IKeyStrokeAssignEvent,
  PrioritySorterConfig
} from './LogicSimulatorCCommon';

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
  'K_NONE'
];

export namespace KeyEventPrioritySorter {
  const local = new (class {
    holdCount: number = 0;
    commitEventQueue: IKeyStrokeAssignEvent[] = [];
  })();

  export function pushStrokeAssignEvent(ev: IKeyStrokeAssignEvent) {
    local.commitEventQueue.push(ev);
    if (ev.type === 'down') {
      local.holdCount++;
    } else {
      local.holdCount--;
    }
  }

  export function readQueuedEventOne(): IKeyStrokeAssignEvent | undefined {
    const { commitEventQueue: queue, holdCount } = local;
    if (queue.length > 0) {
      const latest = queue[queue.length - 1];
      const curTick = Date.now();
      if (
        curTick > latest.tick + PrioritySorterConfig.waitTimeMs ||
        holdCount === 0
      ) {
        queue.sort(
          (a, b) =>
            virtualKeyPriorityOrders.indexOf(a.priorityVirtualKey) -
            virtualKeyPriorityOrders.indexOf(b.priorityVirtualKey)
        );
        return queue.shift();
      }
    }
    return undefined;
  }
}
