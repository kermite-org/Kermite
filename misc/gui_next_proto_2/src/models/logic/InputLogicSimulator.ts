import { VirtualKeyTexts } from '~defs/VirtualKeyTexts';
import { EditorModel } from '~models/EditorModel';
import { IInputLogicSimulator } from './InputLogicSimulator.interface';

export class InputLogicSimulator implements IInputLogicSimulator {
  private editorModel!: EditorModel;
  private timerHandle: number | undefined;

  private _inputResultText: string = '';

  get inputResultText() {
    return this._inputResultText;
  }

  setEditModel(editorModel: EditorModel) {
    this.editorModel = editorModel;
  }

  clearInputResultText() {
    this._inputResultText = '';
  }

  handleKeyInput(keyIndex: number, isDown: boolean): void {
    const ku = this.editorModel.profileData.keyboardShape.keyPositions.find(
      (kp) => kp.pk === keyIndex
    );
    if (ku) {
      const keyId = ku.id;
      const assign = this.editorModel.profileData.assigns[`la0.${keyId}`];
      if (assign?.type === 'single2' && assign.primaryOp?.type === 'keyInput') {
        const vk = assign.primaryOp.virtualKey;
        const text = VirtualKeyTexts[vk]?.toLowerCase();

        if (isDown) {
          this._inputResultText += text;
          console.log(this._inputResultText);
        }
      }
    }
  }

  private handleTicker = () => {};

  start() {
    this.timerHandle = setInterval(this.handleTicker, 1000);
  }

  stop() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = undefined;
    }
  }
}
