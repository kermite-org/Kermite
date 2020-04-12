import { IKeyUnitCardModel, makeKeyUnitCardModel } from './KeyUnitCardModel';
import { makeLayerListModel, ILayerListModel } from './LayerListModel';
import { LayerManagementModel } from './LayerManagementModel';
import {
  IKeyAssignEditModel,
  makeKeyAssignEditModel,
} from './KeyAssignEditModel';
import { editorModule } from '~models/core/EditorModule';

class EditorModel {
  layerManagementModel = new LayerManagementModel();

  get keyAssignEditModel(): IKeyAssignEditModel {
    return makeKeyAssignEditModel();
  }

  get keyUnitCardModels(): IKeyUnitCardModel[] {
    return editorModule.keyPositions.map(makeKeyUnitCardModel);
  }

  get layerListModels(): ILayerListModel[] {
    return editorModule.layers.map(makeLayerListModel);
  }

  get isSlotSelected() {
    return editorModule.isSlotSelected;
  }
}
export const editorModel = new EditorModel();
