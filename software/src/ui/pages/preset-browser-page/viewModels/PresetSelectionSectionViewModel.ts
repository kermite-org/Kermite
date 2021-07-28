import { getProjectKeyFromDeviceAttributes } from '~/shared/funcs/DomainRelatedHelpers';
import { ISelectorSource } from '~/ui/base';
import { useDeviceStatusModel } from '~/ui/commonModels';
import { IPresetSelectionModel } from '~/ui/pages/preset-browser-page/models';

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
  const connectedDeviceProjectKey =
    (deviceStatusModel.isConnected &&
      deviceStatusModel.deviceAttrs &&
      getProjectKeyFromDeviceAttributes(deviceStatusModel.deviceAttrs)) ||
    undefined;

  return {
    projectSelectorSource: model.projectSelectorSource,
    presetSelectorSource: model.presetSelectorSource,
    isLinkButtonActive:
      deviceStatusModel.isConnected &&
      model.projectSelectorSource.options.some(
        (opt) => opt.value === connectedDeviceProjectKey,
      ) &&
      model.currentProjectKey !== connectedDeviceProjectKey,
    linkButtonHandler() {
      if (connectedDeviceProjectKey) {
        model.selectProject(connectedDeviceProjectKey);
      }
    },
    editPresetButtonHandler() {
      model.editSelectedProjectPreset();
    },
  };
}
