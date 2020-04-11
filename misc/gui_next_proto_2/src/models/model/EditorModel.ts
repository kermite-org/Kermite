import { IKeyUnitCardModel, makeKeyUnitCardModel } from './KeyUnitCardModel';
import { makeLayerListModel, ILayerListModel } from './LayerListModel';
import { LayerManagementModel } from './LayerManagementModel';
import {
  IKeyAssignEditModel,
  makeKeyAssignEditModel,
} from './KeyAssignEditModel';
import { editorGetters } from '~models/core/EditorModule';

class EditorModel {
  layerManagementModel = new LayerManagementModel();

  get keyAssignEditModel(): IKeyAssignEditModel {
    return makeKeyAssignEditModel();
  }

  get keyUnitCardModels(): IKeyUnitCardModel[] {
    return editorGetters.keyPositions.map(makeKeyUnitCardModel);
  }

  get layerListModels(): ILayerListModel[] {
    return editorGetters.layers.map(makeLayerListModel);
  }

  get isSlotSelected() {
    return editorGetters.isSlotSelected;
  }
}
export const editorModel = new EditorModel();
