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
    inputQueue: IKeyStrokeAssignEvent[] = [];
    outputQueue: IKeyStrokeAssignEvent[] = [];
    prevDownOutputTick: number = 0;
    outputTickMap: { [keyId: string]: number } = {};
    upEventsDict: { [keyId: string]: IKeyStrokeAssignEvent } = {};
  })();

  export function pushStrokeAssignEvent(ev: IKeyStrokeAssignEvent) {
    if (ev.type === 'down') {
      local.inputQueue.push(ev);
      local.holdCount++;
    } else {
      local.upEventsDict[ev.keyId] = ev;
      local.holdCount--;
    }
  }

  const cfg = {
    inputSimultaneousKeysWaitTime: 50,
    outputMinimumDownEventInterval: 25,
    outputMinimumStrokeDuration: 50
  };

  function processInputQueue() {
    const { inputQueue, holdCount, outputQueue } = local;
    const curTick = Date.now();

    if (inputQueue.length > 0) {
      const latest = inputQueue[inputQueue.length - 1];
      const timeOk = curTick > latest.tick + cfg.inputSimultaneousKeysWaitTime;
      if (timeOk || holdCount === 0) {
        inputQueue.sort(
          (a, b) =>
            virtualKeyPriorityOrders.indexOf(a.priorityVirtualKey) -
            virtualKeyPriorityOrders.indexOf(b.priorityVirtualKey)
        );
        outputQueue.push(...inputQueue);
        local.inputQueue = [];
      }
    }
  }

  function readOutputQueueOne() {
    const { outputQueue } = local;
    const curTick = Date.now();

    if (outputQueue.length > 0) {
      const ev = outputQueue[0];
      if (
        curTick >
        local.prevDownOutputTick + cfg.outputMinimumDownEventInterval
      ) {
        local.prevDownOutputTick = curTick;
        local.outputTickMap[ev.keyId] = curTick;
        outputQueue.shift();
        return ev;
      }
    }

    for (const keyId in local.upEventsDict) {
      const ev = local.upEventsDict[keyId];
      const downTick = local.outputTickMap[keyId];
      if (downTick && curTick > downTick + cfg.outputMinimumStrokeDuration) {
        delete local.outputTickMap[keyId];
        delete local.upEventsDict[keyId];
        return ev;
      }
    }

    return undefined;
  }

  export function readQueuedEventOne(): IKeyStrokeAssignEvent | undefined {
    processInputQueue();
    return readOutputQueueOne();
  }
}
