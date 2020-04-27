import { ILayer } from '~defs/ProfileData';
import { editorModel } from '~ui2/models/EditorModel';

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
    layers: editorModel.layers.map(makeLayerListViewModel)
  };
}
