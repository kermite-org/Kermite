import { ILayer } from '~defs/ProfileData';
import { removeArrayItems } from '~funcs/Utils';
import { editorModel } from '~ui/models';
import { modalConfirm } from '~ui/views/base/BasicModals';
import { callLayerConfigurationModal } from './LayerConfigurationModal';

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
    const ok = await modalConfirm({
      message: `Layer ${this.curLayer.layerName} is removed. Are you sure?`,
      caption: 'Delete Layer'
    });
    if (ok) {
      removeArrayItems(this.layers, this.curLayer);
      editorModel.setCurrentLayerId(this.layers[0].layerId);
    }
  };

  editCurrentLayer = async () => {
    const { layerName, isShiftLayer, defaultScheme } = this.curLayer;
    const sourceValues = {
      layerName,
      isShiftLayer: !!isShiftLayer,
      defaultScheme
    };
    const editValues = await callLayerConfigurationModal({
      sourceValues,
      caption: 'Edit Layer Properties'
    });
    if (editValues) {
      this.curLayer.layerName = editValues.layerName;
      this.curLayer.isShiftLayer = editValues.isShiftLayer;
      this.curLayer.defaultScheme = editValues.defaultScheme;
    }
  };

  addNewLayer = async () => {
    const layerAttrs = await callLayerConfigurationModal({
      sourceValues: {
        layerName: '',
        defaultScheme: 'block',
        isShiftLayer: false
      },
      caption: 'Add Layer'
    });
    if (layerAttrs?.layerName) {
      // todo: use sequential layer number
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
