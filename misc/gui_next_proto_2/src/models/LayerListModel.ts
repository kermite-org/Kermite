import { ILayer } from '~defs/ProfileData';
import { EditorModel } from './EditorModel';

export class LayerListModel {
  constructor(private layer: ILayer, private editorModel: EditorModel) {}

  get layerId() {
    return this.layer.layerId;
  }

  get layerName() {
    return this.layer.layerName;
  }

  get isCurrent() {
    return (
      this.editorModel.layerManagementModel.currentLayerId ===
      this.layer.layerId
    );
  }

  setCurrent = () => {
    this.editorModel.layerManagementModel.currentLayerId = this.layer.layerId;
  };
}
