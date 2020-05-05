import { ILayer } from '~defs/ProfileData';
import { Arrays } from '~funcs/Arrays';
import { editorModel } from '~ui2/models/zAppDomain';
import { callLayerConfigurationModal } from './LayerConfigurationModal';
import { modalConfirm } from '~ui2/views/common/basicModals';

export class LayerManagementPartViewModel {
  private get layers() {
    return editorModel.layers;
  }

  private get curLayer(): ILayer {
    return this.layers.find((la) => la.layerId === editorModel.currentLayerId)!;
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

  deleteCurrentLayer = async () => {
    const ok = await modalConfirm(
      `Layer ${this.curLayer.layerName} is removed. Are you ok?`
    );
    if (ok) {
      Arrays.remove(this.layers, this.curLayer);
      editorModel.setCurrentLayerId(this.layers[0].layerId);
    }
  };

  renameCurrentLayer = async () => {
    const { layerName, isShiftLayer, defaultScheme } = this.curLayer;
    const srcValues = {
      layerName,
      isShiftLayer: !!isShiftLayer,
      defaultScheme
    };
    const editValues = await callLayerConfigurationModal(srcValues);
    if (editValues) {
      this.curLayer.layerName = editValues.layerName;
      this.curLayer.isShiftLayer = editValues.isShiftLayer;
      this.curLayer.defaultScheme = editValues.defaultScheme;
    }
  };

  addNewLayer = async () => {
    const layerAttrs = await callLayerConfigurationModal({
      layerName: '',
      defaultScheme: 'block',
      isShiftLayer: false
    });
    if (layerAttrs && layerAttrs.layerName) {
      //todo: use sequential layer number
      const layerId = `la${(Math.random() * 1000) >> 0}`;
      const { layerName, defaultScheme, isShiftLayer } = layerAttrs;
      this.layers.push({
        layerId,
        layerName,
        defaultScheme,
        isShiftLayer
      });
    }
  };
}
