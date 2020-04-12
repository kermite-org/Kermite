import { ILayer } from '~defs/ProfileData';
import { editorModule } from '~models/core/EditorModule';

export interface ILayerListModel {
  layerId: string;
  layerName: string;
  isCurrent: boolean;
  setCurrent: () => void;
}

export function makeLayerListModel(layer: ILayer): ILayerListModel {
  const { isLayerCurrent, setCurrentLayerId } = editorModule;
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
