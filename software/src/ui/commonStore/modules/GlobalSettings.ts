import { createProjectSig, IGlobalSettings, IResourceOrigin } from '~/shared';
import { uiState, dispatchCoreAction } from '~/ui/commonStore/base';

export const globalSettingsReader = {
  get globalSettings() {
    return uiState.core.globalSettings;
  },
  get isLocalProjectsAvailable(): boolean {
    const {
      developerMode,
      useLocalResources,
      localProjectRootFolderPath,
    } = this.globalSettings;
    return (
      (developerMode && useLocalResources && !!localProjectRootFolderPath) ||
      false
    );
  },
  get isLocalProjectSelectedForEdit(): boolean {
    const {
      developerMode,
      useLocalResources,
      localProjectRootFolderPath,
      globalProjectId,
    } = this.globalSettings;
    return (
      ((developerMode && useLocalResources && !!localProjectRootFolderPath) ||
        false) &&
      !!globalProjectId
    );
  },
  get isDeveloperMode() {
    return this.globalSettings.developerMode;
  },
  get settingsResourceOrigin(): IResourceOrigin {
    const {
      developerMode,
      useLocalResources,
      localProjectRootFolderPath,
    } = this.globalSettings;
    return developerMode && useLocalResources && !!localProjectRootFolderPath
      ? 'local'
      : 'online';
  },
  get globalProjectKey(): string {
    const { globalProjectId } = this.globalSettings;
    const origin = this.settingsResourceOrigin;
    return (globalProjectId && createProjectSig(origin, globalProjectId)) || '';
  },
};

export const globalSettingsWriter = {
  writeValue<K extends keyof IGlobalSettings>(
    key: K,
    value: IGlobalSettings[K],
  ) {
    dispatchCoreAction({
      config_writeGlobalSettings: { [key]: value },
    });
  },
};
