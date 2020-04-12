import {
  IKeyUnitCardViewModel,
  makeKeyUnitCardViewModel,
} from './KeyUnitCardViewModel';
import {
  makeLayerListViewModel,
  ILayerListViewModel,
} from './LayerListViewModel';
import { LayerManagementViewModel } from './LayerManagementViewModel';
import {
  IKeyAssignEditViewModel,
  makeKeyAssignEditViewModel,
} from './KeyAssignEditViewModel';
import { editorModel } from '~models/EditorModel';
import { KeyboarPartViewModel } from './KeyboardPartViewModel';

class EditorViewModel {
  layerManagementViewModel = new LayerManagementViewModel();

  keyboardPartViewModel = new KeyboarPartViewModel();

  get keyAssignEditViewModel(): IKeyAssignEditViewModel {
    return makeKeyAssignEditViewModel();
  }

  get keyUnitCardViewModels(): IKeyUnitCardViewModel[] {
    return editorModel.keyPositions.map(makeKeyUnitCardViewModel);
  }

  get layerListViewModels(): ILayerListViewModel[] {
    return editorModel.layers.map(makeLayerListViewModel);
  }

  get isSlotSelected() {
    return editorModel.isSlotSelected;
  }
}
export const editorViewModel = new EditorViewModel();
