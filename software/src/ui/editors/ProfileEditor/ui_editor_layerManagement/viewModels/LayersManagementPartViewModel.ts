import { asyncRerender } from 'qx';
import { removeArrayItems } from '~/shared';
import { generateNextSequentialId } from '~/shared/funcs/DomainRelatedHelpers';
import { texts } from '~/ui/base';
import { modalConfirm } from '~/ui/components';
import { assignerModel } from '~/ui/editors/ProfileEditor/models/AssignerModel';
import {
  callLayerConfigurationModal,
  ILayerConfigurationModelEditValues,
} from '~/ui/editors/ProfileEditor/ui_modal_layerSettings/LayerConfigurationModal';
import { profilesReader } from '~/ui/pages/assigner-page/models';

export interface ILayerManagementPartViewModel {
  canEdit: boolean;
  canShiftBackCurrentLayer: boolean;
  canShiftForwardCurrentLayer: boolean;
  canDeleteCurrentLayer: boolean;
  shiftBackCurrentLayer(): void;
  shiftForwardCurrentLayer(): void;
  editCurrentLayer(): void;
  deleteCurrentLayer(): void;
  addNewLayer(): void;
}

export function makeLayerManagementPartViewModel(): ILayerManagementPartViewModel {
  const { layers } = assignerModel;
  const curLayer = assignerModel.currentLayer!;
  const isCurrentLayerCustom = curLayer?.layerId !== 'la0' || false;

  const canShiftCurrentLayerOrder = (dir: -1 | 1): boolean => {
    if (isCurrentLayerCustom) {
      const index = layers.indexOf(curLayer);
      const nextIndex = index + dir;
      return 1 <= nextIndex && nextIndex < layers.length;
    } else {
      return false;
    }
  };

  const shiftCurrentLayerOrder = (dir: -1 | 1) => {
    const si = layers.indexOf(curLayer);
    const di = si + dir;
    [layers[si], layers[di]] = [layers[di], layers[si]];
  };

  return {
    canEdit: profilesReader.isEditProfileAvailable,
    canShiftBackCurrentLayer: canShiftCurrentLayerOrder(-1),
    canShiftForwardCurrentLayer: canShiftCurrentLayerOrder(1),
    canDeleteCurrentLayer: isCurrentLayerCustom,
    shiftBackCurrentLayer: () => shiftCurrentLayerOrder(-1),
    shiftForwardCurrentLayer: () => shiftCurrentLayerOrder(1),
    deleteCurrentLayer: async () => {
      const ok = await modalConfirm({
        message: `Layer ${curLayer.layerName} is removed. Are you sure?`,
        caption: 'Delete Layer',
      });
      if (ok) {
        removeArrayItems(layers, curLayer);
        assignerModel.setCurrentLayerId(layers[0].layerId);
      }
    },
    editCurrentLayer: async () => {
      const {
        layerName,
        defaultScheme,
        attachedModifiers,
        exclusionGroup,
        initialActive,
      } = curLayer;
      const sourceValues: ILayerConfigurationModelEditValues = {
        layerName,
        attachedModifiers,
        defaultScheme,
        exclusionGroup,
        initialActive,
      };
      const editValues = await callLayerConfigurationModal({
        sourceValues,
        caption: texts.label_assigner_layerModal_modalTitleEdit,
        isRootLayer: !isCurrentLayerCustom,
      });
      if (editValues) {
        curLayer.layerName = editValues.layerName;
        curLayer.attachedModifiers = editValues.attachedModifiers;
        curLayer.defaultScheme = editValues.defaultScheme;
        curLayer.exclusionGroup = editValues.exclusionGroup;
        curLayer.initialActive = editValues.initialActive;
        asyncRerender();
      }
    },
    addNewLayer: async () => {
      const layerAttrs = await callLayerConfigurationModal({
        sourceValues: {
          layerName: '',
          defaultScheme: 'transparent',
          attachedModifiers: 0,
          exclusionGroup: 0,
          initialActive: false,
        },
        caption: texts.label_assigner_layerModal_modalTitleAdd,
        isRootLayer: false,
      });
      if (layerAttrs?.layerName) {
        const existingIds = layers.map((la) => la.layerId);
        const newLayerId = generateNextSequentialId('la', existingIds);
        const {
          layerName,
          defaultScheme,
          attachedModifiers,
          exclusionGroup,
          initialActive,
        } = layerAttrs;
        layers.push({
          layerId: newLayerId,
          layerName,
          defaultScheme,
          attachedModifiers,
          exclusionGroup,
          initialActive,
        });
        asyncRerender();
      }
    },
  };
}
