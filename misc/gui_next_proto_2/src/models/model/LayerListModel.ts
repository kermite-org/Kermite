import { ILayer } from '~defs/ProfileData';
import { editorState } from '~models/core/EditorState';
import { editorMutations } from '~models/core/EditorMutations';

export interface ILayerListModel {
  layerId: string;
  layerName: string;
  isCurrent: boolean;
  setCurrent: () => void;
}

export function makeLayerListModel(layer: ILayer): ILayerListModel {
  const { layerId, layerName } = layer;
  const isCurrent = editorState.currentLayerId === layerId;
  const setCurrent = () => editorMutations.setCurrentLayerId(layerId);

  return {
    layerId,
    layerName,
    isCurrent,
    setCurrent,
  };
}
