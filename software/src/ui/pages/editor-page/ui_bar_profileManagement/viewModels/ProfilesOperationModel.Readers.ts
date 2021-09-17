import { uiReaders } from '~/ui/commonStore';
import { editorModel } from '~/ui/features/ProfileEditor/models/EditorModel';
import { profilesReader } from '~/ui/pages/editor-page/models';

export const profilesOperationReader = {
  get CanWriteKeyMappingToDevice(): boolean {
    const { deviceStatus, globalSettings, allProjectPackageInfos } = uiReaders;
    const { developerMode, allowCrossKeyboardKeyMappingWrite } = globalSettings;
    const { profileEditSource } = profilesReader;
    const isInternalProfile = profileEditSource.type === 'InternalProfile';
    const isDeviceConnected = deviceStatus.isConnected;

    const refProjectId = editorModel.profileData.projectId;
    const standardFirmwareIds = ['HCV52K', 'HCV52L'];
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
      return isInternalProfile && isDeviceConnected;
    } else {
      return isInternalProfile && isDeviceConnected && isProjectMatched;
    }
  },
  get canSaveProfile(): boolean {
    const { profileEditSource } = profilesReader;
    return (
      profileEditSource.type === 'ProfileNewlyCreated' ||
      profileEditSource.type === 'ExternalFile' ||
      (profileEditSource.type === 'InternalProfile' && editorModel.checkDirty())
    );
  },
  get isCurrentProfileInternal(): boolean {
    return profilesReader.profileEditSource.type === 'InternalProfile';
  },
  get isMenuItemSaveEnabled(): boolean {
    const { profileEditSource } = profilesReader;
    return (
      profileEditSource.type === 'ProfileNewlyCreated' ||
      profileEditSource.type === 'ExternalFile'
    );
  },
};
