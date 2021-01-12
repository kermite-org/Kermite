import { ILayer, removeArrayItems } from '@kermite/shared';
import { modalConfirm } from '~/base/dialog/BasicModals';
import { models } from '~/models';
import {
  ILayerConfigurationModelEditValues,
  callLayerConfigurationModal,
} from '~/views/modals/LayerConfigurationModal';

export class LayerManagementPartViewModel {
  private get layers() {
    return models.editorModel.layers;
  }

  private get curLayer(): ILayer {
    return this.layers.find(
      (la) => la.layerId === models.editorModel.currentLayerId,
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

  get canShiftBackCurrentLayer() {
    return this.canShiftCurrentLayerOrder(-1);
  }

  get canShiftForwardCurrentLayer() {
    return this.canShiftCurrentLayerOrder(1);
  }

  get canDeleteCurrentLayer() {
    return this.isCurrentLayerCustom;
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
      caption: 'Delete Layer',
    });
    if (ok) {
      removeArrayItems(this.layers, this.curLayer);
      models.editorModel.setCurrentLayerId(this.layers[0].layerId);
    }
  };

  editCurrentLayer = async () => {
    const {
      layerName,
      defaultScheme,
      attachedModifiers,
      exclusionGroup,
      initialActive,
    } = this.curLayer;
    const sourceValues: ILayerConfigurationModelEditValues = {
      layerName,
      attachedModifiers,
      defaultScheme,
      exclusionGroup,
      initialActive,
    };
    const editValues = await callLayerConfigurationModal({
      sourceValues,
      caption: 'Edit Layer Properties',
      isRootLayer: !this.isCurrentLayerCustom,
    });
    if (editValues) {
      this.curLayer.layerName = editValues.layerName;
      this.curLayer.attachedModifiers = editValues.attachedModifiers;
      this.curLayer.defaultScheme = editValues.defaultScheme;
      this.curLayer.exclusionGroup = editValues.exclusionGroup;
      this.curLayer.initialActive = editValues.initialActive;
    }
  };

  private getNewLayerId() {
    const layerIdNumbers = this.layers.map((la) => {
      const m = la.layerId.match(/^la(\d+)$/);
      return (m && parseInt(m[1])) || 0;
    });
    const newLayerNumber = Math.max(...layerIdNumbers) + 1;
    return `la${newLayerNumber}`;
  }

  addNewLayer = async () => {
    const layerAttrs = await callLayerConfigurationModal({
      sourceValues: {
        layerName: '',
        defaultScheme: 'transparent',
        attachedModifiers: undefined,
        exclusionGroup: 0,
        initialActive: false,
      },
      caption: 'Add Layer',
      isRootLayer: false,
    });
    if (layerAttrs?.layerName) {
      const layerId = this.getNewLayerId();
      const {
        layerName,
        defaultScheme,
        attachedModifiers,
        exclusionGroup,
        initialActive,
      } = layerAttrs;
      this.layers.push({
        layerId,
        layerName,
        defaultScheme,
        attachedModifiers,
        exclusionGroup,
        initialActive,
      });
    }
  };
}
