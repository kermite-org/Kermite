import { getHidKeyCodeEx } from '~defs/HidKeyCodes';
import { VirtualKey } from '~defs/VirtualKeys';

interface IOutputKeyEvent {
  hidKeyCode: number;
  isDown: boolean;
  tick: number;
}
interface IOutputKeyPrioritySorter {
  setDesinationProc(proc: (ev: IOutputKeyEvent) => void): void;
  pushInputEvent(ev: IOutputKeyEvent): void;
  processUpdate(): void;
}

// const bypass = false
const bypass = true;
const waitTimeMs = 50;

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
const hidKeyPriorityOrders = virtualKeyPriorityOrders.map((vk) =>
  getHidKeyCodeEx(vk, 'JP')
);

export class OutputKeyPrioritySorter implements IOutputKeyPrioritySorter {
  private outputEvents: IOutputKeyEvent[] = [];

  private holdCount: number = 0;

  private destinationProc?: (ev: IOutputKeyEvent) => void;

  setDesinationProc(proc: (ev: IOutputKeyEvent) => void) {
    this.destinationProc = proc;
  }

  pushInputEvent(ev: IOutputKeyEvent) {
    if (bypass) {
      this.destinationProc!(ev);
      return;
    }
    this.outputEvents.push(ev);
    if (ev.isDown) {
      this.holdCount++;
    } else {
      this.holdCount--;
    }
  }

  processUpdate(): void {
    if (this.outputEvents.length > 0) {
      const latest = this.outputEvents[this.outputEvents.length - 1];
      const curTick = Date.now();
      if (curTick > latest.tick + waitTimeMs || this.holdCount === 0) {
        this.outputEvents.sort(
          (a, b) =>
            hidKeyPriorityOrders.indexOf(a.hidKeyCode) -
            hidKeyPriorityOrders.indexOf(b.hidKeyCode)
        );
        this.outputEvents.forEach(this.destinationProc!);
        this.outputEvents = [];
      }
    }
  }
}
