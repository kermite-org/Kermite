import { VirtualKey } from '~model/HighLevelDefs';
import { IKeyAssignEntry } from '~defs/data';
import { KeyAssignEventWithTick, IChannel, KeyAssignEvent } from './common';

const waitTimeMs = 200;
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

  'K_Minus'
];

function getAssignOrder(assign: IKeyAssignEntry): number {
  let order = 0;
  if (assign.type === 'keyInput') {
    order = virtualKeyPriorityOrders.indexOf(assign.virtualKey);
    if (order === -1) {
      order = 999;
    }
  } else {
    order = -100;
  }
  return order;
}

export class PrioritySorterModule {
  events: KeyAssignEventWithTick[] = [];
  dstChannel!: IChannel<KeyAssignEvent>;

  setupChain(
    srcChannel: IChannel<KeyAssignEvent>,
    dstChannel: IChannel<KeyAssignEvent>
  ) {
    srcChannel.subscribe(ev => {
      this.events.push({ ...ev, tick: Date.now() });
    });
    this.dstChannel = dstChannel;
  }

  processTicker() {
    if (this.events.length > 0) {
      const latest = this.events[this.events.length - 1];
      const curTick = Date.now();
      if (curTick > latest.tick + waitTimeMs) {
        this.events.sort(
          (a, b) => getAssignOrder(a.assign) - getAssignOrder(b.assign)
        );
        this.events.forEach(ev => {
          const { keyId, assign } = ev;
          this.dstChannel.emit({ keyId, assign });
        });
        this.events = [];
      }
    }
  }
}
