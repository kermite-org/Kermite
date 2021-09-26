import { getProjectKeyFromDeviceAttributes } from '~/shared/funcs/DomainRelatedHelpers';
import { ISelectorSource } from '~/ui/base';
import { IPresetSelectionModel } from '~/ui/features/PresetBrowser/models';
import { uiReaders } from '~/ui/store';

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
  const { deviceStatus } = uiReaders;
  const connectedDeviceProjectKey =
    (deviceStatus.isConnected &&
      deviceStatus.deviceAttrs &&
      getProjectKeyFromDeviceAttributes(deviceStatus.deviceAttrs)) ||
    undefined;

  return {
    projectSelectorSource: model.projectSelectorSource,
    presetSelectorSource: model.presetSelectorSource,
    isLinkButtonActive:
      deviceStatus.isConnected &&
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
