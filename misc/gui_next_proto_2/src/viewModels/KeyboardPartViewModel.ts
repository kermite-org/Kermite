import { editorModel } from '~models/EditorModel';

export class KeyboarPartViewModel {
  clearAssignSlotSelection = editorModel.clearAssignSlotSelection;

  get bodyPathMarkupText() {
    return editorModel.bodyPathMarkupText;
  }
}
