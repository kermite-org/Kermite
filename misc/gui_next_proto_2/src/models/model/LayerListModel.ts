import { ILayer } from '~defs/ProfileData';
// import { editorState } from '~models/core/EditorModule';
import { editorMutations, editorGetters } from '~models/core/EditorModule';

export interface ILayerListModel {
  layerId: string;
  layerName: string;
  isCurrent: boolean;
  setCurrent: () => void;
}

export function makeLayerListModel(layer: ILayer): ILayerListModel {
  const { layerId, layerName } = layer;
  const isCurrent = editorGetters.isLayerCurrent(layerId);
  const setCurrent = () => editorMutations.setCurrentLayerId(layerId);

  return {
    layerId,
    layerName,
    isCurrent,
    setCurrent,
  };
}
