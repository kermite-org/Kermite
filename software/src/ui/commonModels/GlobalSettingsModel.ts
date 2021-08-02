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

  async loadInitialGlobalSettings() {
    this.globalSettings = await ipcAgent.async.config_getGlobalSettings();
  }

  get isLocalProjectsAvailable() {
    return this.globalSettings.useLocalResouces;
  }
})();
