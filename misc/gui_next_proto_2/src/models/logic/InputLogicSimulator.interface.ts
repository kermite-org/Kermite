import { EditorModel } from '~models/EditorModel';

export interface IInputLogicSimulator {
  setEditModel(editorModel: EditorModel): void;
  inputResultText: string;
  clearInputResultText(): void;
  handleKeyInput(keyIndex: number, isDown: boolean): void;
  start(): void;
  stop(): void;
}
