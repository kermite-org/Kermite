import { VirtualKeyTexts } from '~defs/VirtualKeyTexts';
import { EditorModel } from '~models/EditorModel';
import { IInputLogicSimulator } from './InputLogicSimulator.interface';
import { app } from '~models/appGlobal';
import { VirtualKey } from '~defs/VirtualKeys';

const TH = 400;

type ITrigger = 'down' | 'tap' | 'hold';

class TriggerResolver {
  private downTick: number = 0;
  private resolving: boolean = false;

  constructor(
    private keyId: string,
    private destProc: (keyId: string, trigger: ITrigger) => void
  ) {}

  private emitTrigger(trigger: ITrigger) {
    this.destProc(this.keyId, trigger);
  }

  down() {
    this.downTick = Date.now();
    // this.emitTrigger('down');
    this.resolving = true;
  }

  up() {
    const curTick = Date.now();
    if (curTick < this.downTick + TH) {
      this.emitTrigger('tap');
    }
    this.resolving = false;
  }

  tick() {
    if (this.resolving) {
      const curTick = Date.now();
      if (curTick >= this.downTick + TH) {
        this.emitTrigger('hold');
        this.resolving = false;
      }
    }
  }
}

interface IOutputEvent {
  virtualKey: VirtualKey;
  tick: number;
  processed: boolean;
}

const priorityOrders: VirtualKey[] = [
  'K_N',
  'K_Y',
  'K_K',
  'K_T',
  'K_E',
  'K_I',
  'K_A',
  'K_O',
  'K_U',
];

export class InputLogicSimulator implements IInputLogicSimulator {
  private editorModel!: EditorModel;

  private timerHandle: number | undefined;

  private _inputResultText: string = '';

  get inputResultText() {
    return this._inputResultText;
  }

  setEditorModel(editorModel: EditorModel) {
    this.editorModel = editorModel;
  }

  clearInputResultText() {
    this._inputResultText = '';
  }

  private outputEvents: IOutputEvent[] = [];
  private triggerResolvers: { [keyId: string]: TriggerResolver } = {};

  private onOutputEvent = (ev: IOutputEvent) => {
    this._inputResultText +=
      VirtualKeyTexts[ev.virtualKey]?.toLowerCase() || '';
    app.rerender();
    ev.processed = true;
  };

  private getKeyResolverById(keyId: string) {
    let resolver = this.triggerResolvers[keyId];
    if (!resolver) {
      resolver = this.triggerResolvers[keyId] = new TriggerResolver(
        keyId,
        this.onTriggerDetected
      );
    }
    return resolver;
  }

  private holdCount: number = 0;

  private onKeyInput(keyId: string, isDown: boolean) {
    const resolver = this.getKeyResolverById(keyId);
    if (isDown) {
      resolver.down();
      this.holdCount++;
    } else {
      resolver.up();
      this.holdCount--;
    }
  }

  handleKeyInput(keyIndex: number, isDown: boolean) {
    const ku = this.editorModel.profileData.keyboardShape.keyPositions.find(
      (kp) => kp.pk === keyIndex
    );
    if (ku) {
      this.onKeyInput(ku.id, isDown);
    }
  }

  private onTriggerDetected = (keyId: string, trigger: ITrigger) => {
    const assign = this.editorModel.profileData.assigns[`la0.${keyId}`];
    if (assign?.type === 'single2') {
      const tick = Date.now();
      if (
        (trigger === 'down' || trigger === 'tap') &&
        assign.primaryOp?.type === 'keyInput'
      ) {
        this.outputEvents.push({
          virtualKey: assign.primaryOp.virtualKey,
          tick,
          processed: false,
        });
      }
      if (trigger === 'hold' && assign.secondaryOp?.type === 'keyInput') {
        this.outputEvents.push({
          virtualKey: assign.secondaryOp.virtualKey,
          tick,
          processed: false,
        });
      }
    }
  };

  private handleTicker = () => {
    for (const key in this.triggerResolvers) {
      this.triggerResolvers[key].tick();
    }

    if (this.outputEvents.length > 0) {
      const latest = this.outputEvents[this.outputEvents.length - 1];
      const curTick = Date.now();
      if (curTick > latest.tick + 20 || this.holdCount === 0) {
        this.outputEvents.sort(
          (a, b) =>
            priorityOrders.indexOf(a.virtualKey) -
            priorityOrders.indexOf(b.virtualKey)
        );
        this.outputEvents.forEach(this.onOutputEvent);
        this.outputEvents = [];
      }
    }
  };

  start() {
    this.timerHandle = setInterval(this.handleTicker, 10);
  }

  stop() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = undefined;
    }
  }
}
