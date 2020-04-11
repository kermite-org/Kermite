import { IKeyUnitCardModel, makeKeyUnitCardModel } from './KeyUnitCardModel';
import { makeLayerListModel, ILayerListModel } from './LayerListModel';
import { LayerManagementModel } from './LayerManagementModel';
import { editorState } from '~models/core/EditorState';
import { KeyAssignEditModel } from './KeyAssignEditModel';

class EditorModel {
  layerManagementModel = new LayerManagementModel();

  get keyUnitCardModels(): IKeyUnitCardModel[] {
    return editorState.profileData.keyboardShape.keyPositions.map(
      makeKeyUnitCardModel
    );
  }

  get layerListModels(): ILayerListModel[] {
    return editorState.profileData.layers.map(makeLayerListModel);
  }

  private _keyAssignEditModel: KeyAssignEditModel = new KeyAssignEditModel('');
  get keyAssignEditModel(): KeyAssignEditModel | undefined {
    const curLayerId = editorState.currentLayerId;
    const curKeyUnitId = editorState.currentKeyUnitId;
    if (!(curLayerId && curKeyUnitId)) {
      return undefined;
    }
    const slotAddress = `${curLayerId}.${curKeyUnitId}`;
    if (this._keyAssignEditModel.slotAddress !== slotAddress) {
      this._keyAssignEditModel = new KeyAssignEditModel(slotAddress);
    }
    return this._keyAssignEditModel;
  }
}
export const editorModel = new EditorModel();
