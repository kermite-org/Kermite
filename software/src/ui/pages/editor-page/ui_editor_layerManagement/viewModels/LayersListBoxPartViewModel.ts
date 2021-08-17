import { ILayer } from '~/shared';
import { uiStatusModel } from '~/ui/commonModels';
import { profilesReader } from '~/ui/pages/editor-page/models';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';

export interface ILayerListViewModel {
  layerId: string;
  layerName: string;
  isCurrent: boolean;
  setCurrent: () => void;
}

export interface ILayerListBoxPartViewModel {
  layers: ILayerListViewModel[];
}

function makeLayerListViewModel(layer: ILayer): ILayerListViewModel {
  const { isLayerCurrent, setCurrentLayerId } = editorModel;
  const { layerId, layerName } = layer;
  const isCurrent = isLayerCurrent(layerId);
  const setCurrent = () => {
    setCurrentLayerId(layerId);
    uiStatusModel.stopLiveMode();
  };
  return {
    layerId,
    layerName,
    isCurrent,
    setCurrent,
  };
}

export function makeLayerListBoxPartViewModel(): ILayerListBoxPartViewModel {
  if (!profilesReader.isEditProfileAvailable) {
    return { layers: [] };
  }
  return {
    layers: editorModel.layers.map(makeLayerListViewModel),
  };
}
