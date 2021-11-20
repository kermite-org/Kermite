import { asyncRerender } from 'alumina';
import { ILayer, removeArrayItemsMatched } from '~/shared';
import { generateNextSequentialId } from '~/shared/funcs/DomainRelatedHelpers';
import { texts } from '~/ui/base';
import { modalConfirm } from '~/ui/components';
import { assignerModel } from '~/ui/featureEditors/ProfileEditor/models/AssignerModel';
import {
  callLayerConfigurationModal,
  ILayerConfigurationModelEditValues,
} from '~/ui/featureEditors/ProfileEditor/ui_modal_layerSettings/LayerConfigurationModal';
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

const actions = {
  addLayer(layer: ILayer) {
    assignerModel.patchEditProfileData((profile) => profile.layers.push(layer));
  },
  removeLayer(layerId: string) {
    assignerModel.patchEditProfileData((profile) =>
      removeArrayItemsMatched(profile.layers, (la) => la.layerId === layerId),
    );
  },
  shiftLayerOrder(layerId: string, dir: -1 | 1) {
    assignerModel.patchEditProfileData((profile) => {
      const { layers } = profile;
      const si = layers.findIndex((la) => la.layerId === layerId);
      const di = si + dir;
      [layers[si], layers[di]] = [layers[di], layers[si]];
    });
  },
  setLayerAttributes(
    layerId: string,
    editValues: ILayerConfigurationModelEditValues,
  ) {
    assignerModel.patchEditProfileData((profile) => {
      const layer = profile.layers.find((la) => la.layerId === layerId);
      if (layer) {
        layer.layerName = editValues.layerName;
        layer.attachedModifiers = editValues.attachedModifiers;
        layer.defaultScheme = editValues.defaultScheme;
        layer.exclusionGroup = editValues.exclusionGroup;
        layer.initialActive = editValues.initialActive;
      }
    });
  },
};

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
    actions.shiftLayerOrder(curLayer.layerId, dir);
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
        actions.removeLayer(curLayer.layerId);
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
        caption: texts.assignerLayerModal.modalTitleEdit,
        isRootLayer: !isCurrentLayerCustom,
      });
      if (editValues) {
        actions.setLayerAttributes(curLayer.layerId, editValues);
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
        caption: texts.assignerLayerModal.modalTitleAdd,
        isRootLayer: false,
      });
      if (layerAttrs?.layerName) {
        const existingIds = layers.map((la) => la.layerId);
        const newLayerId = generateNextSequentialId('la', existingIds);
        const layer: ILayer = {
          layerId: newLayerId,
          ...layerAttrs,
        };
        actions.addLayer(layer);
        asyncRerender();
      }
    },
  };
}
