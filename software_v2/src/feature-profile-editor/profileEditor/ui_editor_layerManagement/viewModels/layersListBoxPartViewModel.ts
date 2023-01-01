import { ILayer } from '~/app-shared';
import { profileEditorStore } from '../../../store';
import { profileEditorConfig } from '../../adapters';
import { assignerModel } from '../../models';

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
    profileEditorStore.actions.stopLiveMode();
  };
  return {
    layerId,
    layerName,
    isCurrent,
    setCurrent,
  };
}

export function makeLayerListBoxPartViewModel(): ILayerListBoxPartViewModel {
  if (!profileEditorConfig.isEditProfileAvailable) {
    return { layers: [] };
  }
  return {
    layers: assignerModel.layers.map(makeLayerListViewModel),
  };
}
