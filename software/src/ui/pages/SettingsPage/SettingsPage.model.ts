import { useEffect, useLocal } from 'qx';
import { appUi, ipcAgent, ISelectorOption } from '~/ui/base';
import {
  commitUiSettings,
  globalSettingsWriter,
  uiReaders,
  uiState,
} from '~/ui/store';

export interface ISettingsPageModel {
  flagDeveloperMode: boolean;
  setFlagDeveloperMode: (value: boolean) => void;
  flagUseLocalResources: boolean;
  setFlagUseLocalResources: (value: boolean) => void;
  flagAllowCrossKeyboardKeyMappingWrite: boolean;
  setFlagAllowCrossKeyboardKeyMappingWrite: (value: boolean) => void;
  canChangeLocalRepositoryFolderPath: boolean;
  localRepositoryFolderPathDisplayValue: string;
  handleSelectLocalRepositoryFolder: () => void;
  isLocalRepositoryFolderPathValid: boolean;
  uiScalingOptions: ISelectorOption[];
  uiScalingSelectionValue: string;
  setUiScalingSelectionValue: (value: string) => void;
  appVersionInfo: string;
}

const uiScaleOptions: ISelectorOption[] = [0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3].map(
  (val) => ({ label: `${(val * 100) >> 0}%`, value: val.toString() }),
);

export function useSettingsPageModel(): ISettingsPageModel {
  const local = useLocal({
    fixedProjectRootPath: '',
    temporaryInvalidLocalRepositoryFolderPath: '',
  });

  useEffect(() => {
    (async () => {
      if (appUi.isDevelopment) {
        local.fixedProjectRootPath =
          await ipcAgent.async.config_getProjectRootDirectoryPath();
      }
    })();
  }, []);

  const { globalSettings } = uiReaders;

  const onSelectButton = async () => {
    const path = await ipcAgent.async.file_getOpenDirectoryWithDialog();
    if (path) {
      const valid = await ipcAgent.async.config_checkLocalRepositoryFolderPath(
        path,
      );
      if (!valid) {
        local.temporaryInvalidLocalRepositoryFolderPath = path;
      } else {
        local.temporaryInvalidLocalRepositoryFolderPath = '';
        globalSettingsWriter.writeValue('localProjectRootFolderPath', path);
      }
    }
  };

  const folderPathDisplayValue =
    local.temporaryInvalidLocalRepositoryFolderPath ||
    local.fixedProjectRootPath ||
    globalSettings.localProjectRootFolderPath;

  const appVersionInfo = uiState.core.applicationVersionInfo.version;

  const isDeveloperModeOn = globalSettings.developerMode;

  const canChangeFolder = !local.fixedProjectRootPath && isDeveloperModeOn;

  return {
    flagDeveloperMode: globalSettings.developerMode,
    setFlagDeveloperMode: (value) =>
      globalSettingsWriter.writeValue('developerMode', value),
    flagUseLocalResources: globalSettings.useLocalResources,
    setFlagUseLocalResources: (value) =>
      globalSettingsWriter.writeValue('useLocalResources', value),
    flagAllowCrossKeyboardKeyMappingWrite:
      globalSettings.allowCrossKeyboardKeyMappingWrite,
    setFlagAllowCrossKeyboardKeyMappingWrite: (value) =>
      globalSettingsWriter.writeValue(
        'allowCrossKeyboardKeyMappingWrite',
        value,
      ),
    canChangeLocalRepositoryFolderPath: canChangeFolder,
    localRepositoryFolderPathDisplayValue: folderPathDisplayValue,
    handleSelectLocalRepositoryFolder: onSelectButton,
    isLocalRepositoryFolderPathValid:
      !local.temporaryInvalidLocalRepositoryFolderPath,
    uiScalingOptions: uiScaleOptions,
    uiScalingSelectionValue: uiState.settings.siteDpiScale.toString(),
    setUiScalingSelectionValue: (strVal) =>
      commitUiSettings({ siteDpiScale: parseFloat(strVal) }),
    appVersionInfo,
  };
}
