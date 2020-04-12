import { ILayer } from '~defs/ProfileData';
import { Arrays } from '~funcs/Arrays';
import { editorModule } from '~models/core/EditorModule';

export class LayerManagementModel {
  private get layers() {
    return editorModule.layers;
  }

  private get curLayer(): ILayer {
    return this.layers.find(
      (la) => la.layerId === editorModule.currentLayerId
    )!;
  }

  private get isCurrentLayerCustom() {
    return this.curLayer?.layerId !== 'la0' || false;
  }

  private canShiftCurrentLayerOrder = (dir: -1 | 1): boolean => {
    if (this.isCurrentLayerCustom) {
      const index = this.layers.indexOf(this.curLayer);
      const nextIndex = index + dir;
      return 1 <= nextIndex && nextIndex < this.layers.length;
    } else {
      return false;
    }
  };

  private shiftCurrentLayerOrder(dir: -1 | 1) {
    const { layers } = this;
    const si = layers.indexOf(this.curLayer);
    const di = si + dir;
    [layers[si], layers[di]] = [layers[di], layers[si]];
  }

  get canModifyCurrentLayer() {
    return this.isCurrentLayerCustom;
  }

  get canShiftBackCurrentLayer() {
    return this.canShiftCurrentLayerOrder(-1);
  }

  get canShiftForwardCurrentLayer() {
    return this.canShiftCurrentLayerOrder(1);
  }

  shiftBackCurrentLayer = () => {
    this.shiftCurrentLayerOrder(-1);
  };

  shiftForwardCurrentLayer = () => {
    this.shiftCurrentLayerOrder(1);
  };

  deleteCurrentLayer = () => {
    Arrays.remove(this.layers, this.curLayer);
    editorModule.setCurrentLayerId(this.layers[0].layerId);
  };

  renameCurrentLayer = () => {
    // const newName = await inputLayerNameModal()
    const newName = `layer-${(Math.random() * 1000) >> 0}`;
    this.curLayer.layerName = newName;
  };

  addNewLayer = () => {
    // const newName = await inputLayerNameModal(this.curLayer.layerName)
    const layerId = `la${(Math.random() * 1000) >> 0}`;
    const layerName = `layer-${(Math.random() * 1000) >> 0}`;
    this.layers.push({
      layerId,
      layerName,
    });
  };
}
