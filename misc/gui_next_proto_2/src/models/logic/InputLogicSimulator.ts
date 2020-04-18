import { VirtualKeyTexts } from '~defs/VirtualKeyTexts';
import { EditorModel } from '~models/EditorModel';
import { IInputLogicSimulator } from './InputLogicSimulator.interface';
import { app } from '~models/appGlobal';
import { VirtualKey } from '~defs/VirtualKeys';

interface IInputKeyEvent {
  keyId: string;
  isDown: boolean;
  tick: number;
}

const TH = 400;

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

  private inputKeyEventsQueue: IInputKeyEvent[] = [];

  handleKeyInput(keyIndex: number, isDown: boolean): void {
    const ku = this.editorModel.profileData.keyboardShape.keyPositions.find(
      (kp) => kp.pk === keyIndex
    );
    if (ku) {
      this.inputKeyEventsQueue.push({
        keyId: ku.id,
        isDown,
        tick: Date.now(),
      });
    }
  }

  private downTickMap: { [keyId: string]: number } = {};

  private emitKey(vk: VirtualKey) {
    this._inputResultText += VirtualKeyTexts[vk]?.toLowerCase() || '';
    app.rerender();
  }

  private onTriggerDetected(keyId: string, trigger: 'tap' | 'hold') {
    const assign = this.editorModel.profileData.assigns[`la0.${keyId}`];
    if (assign?.type === 'single2') {
      if (trigger === 'tap' && assign.primaryOp?.type === 'keyInput') {
        this.emitKey(assign.primaryOp.virtualKey);
      }
      if (trigger === 'hold' && assign.secondaryOp?.type === 'keyInput') {
        this.emitKey(assign.secondaryOp.virtualKey);
      }
    }
  }

  private handleInputKeyEvent(ev: IInputKeyEvent) {
    const curTick = Date.now();
    const { keyId, isDown } = ev;
    if (isDown) {
      this.downTickMap[keyId] = curTick;
    } else {
      const downTick = this.downTickMap[keyId];
      if (downTick && curTick - downTick < TH) {
        //tap detected
        this.onTriggerDetected(keyId, 'tap');
        delete this.downTickMap[keyId];
      }
    }
  }

  private checkHoldTriggers() {
    const curTick = Date.now();
    for (const keyId in this.downTickMap) {
      const downTick = this.downTickMap[keyId];
      const dur = curTick - downTick;
      if (dur >= TH) {
        //hold detected
        this.onTriggerDetected(keyId, 'hold');
        delete this.downTickMap[keyId];
      }
    }
  }

  private handleTicker = () => {
    if (this.inputKeyEventsQueue.length > 0) {
      this.inputKeyEventsQueue.forEach((ev) => this.handleInputKeyEvent(ev));
      this.inputKeyEventsQueue = [];
    }
    this.checkHoldTriggers();
  };

  start() {
    this.timerHandle = setInterval(this.handleTicker, 50);
  }

  stop() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = undefined;
    }
  }
}
