import { standardFirmwareIds } from '~/shared';
import { assignerModel } from '~/ui/featureEditors';
import { profilesReader } from '~/ui/pages/assignerPage/models';
import { uiReaders } from '~/ui/store';

export const profilesOperationReader = {
  get CanWriteKeyMappingToDevice(): boolean {
    const { deviceStatus, globalSettings, allProjectPackageInfos } = uiReaders;
    const { developerMode, allowCrossKeyboardKeyMappingWrite } = globalSettings;
    const isDeviceConnected = deviceStatus.isConnected;

    const refProjectId = assignerModel.profileData.projectId;

    const deviceFirmwareId = deviceStatus.isConnected
      ? deviceStatus.deviceAttrs.firmwareId
      : '';
    const deviceProjectId = deviceStatus.isConnected
      ? deviceStatus.deviceAttrs.projectId
      : '';
    const isProjectMatched =
      (standardFirmwareIds.includes(deviceFirmwareId) &&
        deviceProjectId === refProjectId) ||
      allProjectPackageInfos.some(
        (info) =>
          info.projectId === refProjectId &&
          info.firmwares.some(
            (firmware) =>
              firmware.type === 'custom' &&
              firmware.customFirmwareId === deviceFirmwareId,
          ),
      );

    if (developerMode && allowCrossKeyboardKeyMappingWrite) {
      return isDeviceConnected;
    } else {
      return isDeviceConnected && isProjectMatched;
    }
  },
  get canSaveProfile(): boolean {
    const { profileEditSource } = profilesReader;
    return (
      profileEditSource.type === 'ProfileNewlyCreated' ||
      (profileEditSource.type === 'InternalProfile' &&
        assignerModel.checkDirty())
    );
  },
  get isCurrentProfileInternal(): boolean {
    return profilesReader.profileEditSource.type === 'InternalProfile';
  },
  get isMenuItemSaveEnabled(): boolean {
    const { profileEditSource } = profilesReader;
    return profileEditSource.type === 'ProfileNewlyCreated';
  },
};
