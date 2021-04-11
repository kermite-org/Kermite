import { getProjectOriginAndIdFromSig } from '~/shared/funcs/DomainRelatedHelpers';
import { ISelectorSource, useDeviceStatusModel } from '~/ui/common';
import { IPresetSelectionModel } from '~/ui/preset-browser-page/models';

export interface IPresetSelectionSectionViewModel {
  projectSelectorSource: ISelectorSource;
  presetSelectorSource: ISelectorSource;
  isLinkButtonActive: boolean;
  linkButtonHandler(): void;
  editPresetButtonHandler(): void;
}

export function usePresetSelectionSectionViewModel(
  model: IPresetSelectionModel,
): IPresetSelectionSectionViewModel {
  const deviceStatusModel = useDeviceStatusModel();
  return {
    projectSelectorSource: model.projectSelectorSource,
    presetSelectorSource: model.presetSelectorSource,
    isLinkButtonActive:
      deviceStatusModel.isConnected &&
      deviceStatusModel.deviceAttrs?.projectId !==
        getProjectOriginAndIdFromSig(model.currentProjectKey || '').projectId,
    linkButtonHandler() {
      const deviceProjectId = deviceStatusModel.deviceAttrs?.projectId || '';
      model.selectProjectByProjectId(deviceProjectId);
    },
    editPresetButtonHandler() {
      model.editSelectedProjectPreset();
    },
  };
}
