import { ILayer } from '~defs/ProfileData';
import { models } from '~ui/models';

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
  const { isLayerCurrent, setCurrentLayerId } = models.editorModel;
  const { layerId, layerName } = layer;
  const isCurrent = isLayerCurrent(layerId);
  const setCurrent = () => setCurrentLayerId(layerId);
  return {
    layerId,
    layerName,
    isCurrent,
    setCurrent
  };
}

export function makeLayerListBoxPartViewModel(): ILayerListBoxPartViewModel {
  return {
    layers: models.editorModel.layers.map(makeLayerListViewModel)
  };
}
