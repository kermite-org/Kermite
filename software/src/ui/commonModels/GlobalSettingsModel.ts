import { IGlobalSettings } from '~/shared';
import { dispatchCoreAction } from '~/ui/commonModels/ActionDispatcher';
import { uiState } from '~/ui/commonModels/UiState';

class GlobalSettingsModel {
  get globalSettings() {
    return uiState.core.globalSettings;
  }

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
  }

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
  }

  get isDeveloperMode() {
    return this.globalSettings.developerMode;
  }

  getValue<K extends keyof IGlobalSettings>(key: K): IGlobalSettings[K] {
    return this.globalSettings[key];
  }

  writeValue<K extends keyof IGlobalSettings>(
    key: K,
    value: IGlobalSettings[K],
  ) {
    dispatchCoreAction({
      writeGlobalSettings: { partialConfig: { [key]: value } },
    });
  }
}

export const globalSettingsModel = new GlobalSettingsModel();
