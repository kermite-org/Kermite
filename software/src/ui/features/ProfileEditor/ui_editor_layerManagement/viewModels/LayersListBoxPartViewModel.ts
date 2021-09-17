import { ILayer } from '~/shared';
import { uiActions } from '~/ui/commonStore';
import { editorModel } from '~/ui/features/ProfileEditor/models/EditorModel';
import { profilesReader } from '~/ui/pages/assigner-page/models';

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
    uiActions.stopLiveMode();
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
