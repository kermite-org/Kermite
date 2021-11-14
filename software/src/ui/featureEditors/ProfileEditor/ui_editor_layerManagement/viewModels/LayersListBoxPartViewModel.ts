import { ILayer } from '~/shared';
import { assignerModel } from '~/ui/featureEditors/ProfileEditor/models/AssignerModel';
import { profilesReader } from '~/ui/pages/assigner-page/models';
import { uiActions } from '~/ui/store';

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
  const { isLayerCurrent, setCurrentLayerId } = assignerModel;
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
    layers: assignerModel.layers.map(makeLayerListViewModel),
  };
}
