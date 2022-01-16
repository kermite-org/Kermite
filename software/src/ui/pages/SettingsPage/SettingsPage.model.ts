import { appUi, ipcAgent, ISelectorOption } from '~/ui/base';
import {
  commitUiSettings,
  globalSettingsWriter,
  uiReaders,
  uiState,
} from '~/ui/store';

interface ISettingsPageStore {
  readers: {
    flagDeveloperMode: boolean;
    flagUseLocalResources: boolean;
    flagAllowCrossKeyboardKeyMappingWrite: boolean;
    canChangeLocalRepositoryFolderPath: boolean;
    localRepositoryFolderPathDisplayValue: string;
    isLocalRepositoryFolderPathValid: boolean;
    uiScalingOptions: ISelectorOption[];
    uiScalingSelectionValue: string;
    appVersionInfo: string;
    flagShowDevelopmentPackages: boolean;
  };
  actions: {
    initialize(): void;
    setFlagDeveloperMode(value: boolean): void;
    setFlagUseLocalResources(value: boolean): void;
    setFlagAllowCrossKeyboardKeyMappingWrite(value: boolean): void;
    handleSelectLocalRepositoryFolder(): void;
    setUiScalingSelectionValue(value: string): void;
    setFlagShowDevelopmentPackages(value: boolean): void;
  };
}

const helpers = {
  createUiScalingSelectorOptions(): ISelectorOption[] {
    const sourceScales = [0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3];
    if (appUi.processEnv.FE_ADD_SMALL_UI_SCALES) {
      sourceScales.unshift(...[0.3, 0.4, 0.5, 0.6]);
    }
    return sourceScales.map((val) => ({
      label: `${(val * 100) >> 0}%`,
      value: val.toString(),
    }));
  },
};

export function createSettingsPageStore(): ISettingsPageStore {
  type IState = {
    fixedProjectRootPath: string;
    temporaryInvalidLocalRepositoryFolderPath: string;
  };
  type IReaders = ISettingsPageStore['readers'];
  type IActions = ISettingsPageStore['actions'];

  const state: IState = {
    fixedProjectRootPath: '',
    temporaryInvalidLocalRepositoryFolderPath: '',
  };

  const constants = {
    uiScaleOptions: helpers.createUiScalingSelectorOptions(),
  };

  const readers: IReaders = {
    get flagDeveloperMode() {
      return uiReaders.globalSettings.developerMode;
    },
    get flagUseLocalResources() {
      return uiReaders.globalSettings.useLocalResources;
    },
    get flagAllowCrossKeyboardKeyMappingWrite() {
      return uiReaders.globalSettings.allowCrossKeyboardKeyMappingWrite;
    },
    get canChangeLocalRepositoryFolderPath() {
      const isDeveloperModeOn = uiReaders.globalSettings.developerMode;
      return !state.fixedProjectRootPath && isDeveloperModeOn;
    },
    get localRepositoryFolderPathDisplayValue() {
      return (
        state.temporaryInvalidLocalRepositoryFolderPath ||
        state.fixedProjectRootPath ||
        uiReaders.globalSettings.localProjectRootFolderPath
      );
    },
    get isLocalRepositoryFolderPathValid() {
      return !state.temporaryInvalidLocalRepositoryFolderPath;
    },
    get uiScalingOptions() {
      return constants.uiScaleOptions;
    },
    get uiScalingSelectionValue() {
      return uiState.settings.siteDpiScale.toString();
    },
    get appVersionInfo() {
      return uiState.core.applicationVersionInfo.version;
    },
    get flagShowDevelopmentPackages() {
      return uiReaders.globalSettings.showDevelopmentPackages;
    },
  };

  const actions: IActions = {
    async initialize() {
      if (appUi.isDevelopment) {
        state.fixedProjectRootPath =
          await ipcAgent.async.config_getProjectRootDirectoryPath();
      }
    },
    setFlagDeveloperMode(value: boolean) {
      globalSettingsWriter.writeValue('developerMode', value);
    },
    setFlagUseLocalResources(value: boolean) {
      globalSettingsWriter.writeValue('useLocalResources', value);
    },
    setFlagAllowCrossKeyboardKeyMappingWrite(value: boolean) {
      globalSettingsWriter.writeValue(
        'allowCrossKeyboardKeyMappingWrite',
        value,
      );
    },
    async handleSelectLocalRepositoryFolder() {
      const path = await ipcAgent.async.file_getOpenDirectoryWithDialog();
      if (path) {
        const valid =
          await ipcAgent.async.config_checkLocalRepositoryFolderPath(path);
        if (!valid) {
          state.temporaryInvalidLocalRepositoryFolderPath = path;
        } else {
          state.temporaryInvalidLocalRepositoryFolderPath = '';
          globalSettingsWriter.writeValue('localProjectRootFolderPath', path);
        }
      }
    },
    setUiScalingSelectionValue(strVal: string) {
      commitUiSettings({ siteDpiScale: parseFloat(strVal) });
    },
    setFlagShowDevelopmentPackages(value) {
      globalSettingsWriter.writeValue('showDevelopmentPackages', value);
    },
  };

  actions.initialize();

  return { readers, actions };
}
