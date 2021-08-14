import { globalSettingsDefault, IGlobalSettings } from '~/shared';
import { ipcAgent } from '~/ui/base';

class GlobalSettingsModel {
  globalSettings: IGlobalSettings = globalSettingsDefault;

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
    ipcAgent.async.config_writeGlobalSettings({ [key]: value });
  }

  private onBackendGlobalSettingsChange = (diff: Partial<IGlobalSettings>) => {
    this.globalSettings = { ...this.globalSettings, ...diff };
  };

  async initialize() {
    this.globalSettings = await ipcAgent.async.config_getGlobalSettings();
    ipcAgent.events.config_globalSettingsEvents.subscribe(
      this.onBackendGlobalSettingsChange,
    );
  }

  terminate() {
    ipcAgent.events.config_globalSettingsEvents.unsubscribe(
      this.onBackendGlobalSettingsChange,
    );
  }
}

export const globalSettingsModel = new GlobalSettingsModel();
