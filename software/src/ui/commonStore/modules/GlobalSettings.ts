import { createProjectSig, IGlobalSettings, IResourceOrigin } from '~/shared';
import { uiState, dispatchCoreAction } from '~/ui/commonStore/base';

export const globalSettingsReader = {
  get globalSettings() {
    return uiState.core.globalSettings;
  },
  get isLocalProjectsAvailable(): boolean {
    const {
      developerMode,
      useLocalResouces,
      localProjectRootFolderPath,
    } = this.globalSettings;
    return (
      (developerMode && useLocalResouces && !!localProjectRootFolderPath) ||
      false
    );
  },
  get isLocalProjectSelectedForEdit(): boolean {
    const {
      developerMode,
      useLocalResouces,
      localProjectRootFolderPath,
      globalProjectId,
    } = this.globalSettings;
    return (
      ((developerMode && useLocalResouces && !!localProjectRootFolderPath) ||
        false) &&
      !!globalProjectId
    );
  },
  get isDeveloperMode() {
    return this.globalSettings.developerMode;
  },
  get settingsResouceOrigin(): IResourceOrigin {
    const {
      developerMode,
      useLocalResouces,
      localProjectRootFolderPath,
    } = this.globalSettings;
    return developerMode && useLocalResouces && !!localProjectRootFolderPath
      ? 'local'
      : 'online';
  },
  get globalProjectKey(): string {
    const { globalProjectId } = this.globalSettings;
    const origin = this.settingsResouceOrigin;
    return (globalProjectId && createProjectSig(origin, globalProjectId)) || '';
  },
};

export const globalSettingsWriter = {
  writeValue<K extends keyof IGlobalSettings>(
    key: K,
    value: IGlobalSettings[K],
  ) {
    dispatchCoreAction({
      writeGlobalSettings: { partialConfig: { [key]: value } },
    });
  },
};
