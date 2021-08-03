import { globalSettingsDefault, IGlobalSettings } from '~/shared';
import { ipcAgent } from '~/ui/base';

export const globalSettingsModel = new (class {
  globalSettings: IGlobalSettings = globalSettingsDefault;

  getValue<K extends keyof IGlobalSettings>(key: K): IGlobalSettings[K] {
    return this.globalSettings[key];
  }

  writeValue<K extends keyof IGlobalSettings>(
    key: K,
    value: IGlobalSettings[K],
  ) {
    this.writeGlobalSettings({ ...this.globalSettings, [key]: value });
  }

  writeGlobalSettings(settings: IGlobalSettings) {
    this.globalSettings = settings;
    ipcAgent.async.config_writeGlobalSettings(settings);
  }

  save() {
    ipcAgent.async.config_writeGlobalSettings(this.globalSettings);
  }

  async loadInitialGlobalSettings() {
    this.globalSettings = await ipcAgent.async.config_getGlobalSettings();
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

  get isDeveloperMode() {
    return this.globalSettings.developerMode;
  }
})();
