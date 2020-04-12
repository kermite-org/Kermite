import { ILayer } from '~defs/ProfileData';
import { editorModel } from '~models/EditorModel';

export interface ILayerListViewModel {
  layerId: string;
  layerName: string;
  isCurrent: boolean;
  setCurrent: () => void;
}

export function makeLayerListViewModel(layer: ILayer): ILayerListViewModel {
  const { isLayerCurrent, setCurrentLayerId } = editorModel;
  const { layerId, layerName } = layer;
  const isCurrent = isLayerCurrent(layerId);
  const setCurrent = () => setCurrentLayerId(layerId);
  return {
    layerId,
    layerName,
    isCurrent,
    setCurrent,
  };
}
