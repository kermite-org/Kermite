import { IKeyUnitCardModel, makeKeyUnitCardModel } from './KeyUnitCardModel';
import { makeLayerListModel, ILayerListModel } from './LayerListModel';
import { LayerManagementModel } from './LayerManagementModel';
import { editorState } from '~models/core/EditorState';

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
}
export const editorModel = new EditorModel();
