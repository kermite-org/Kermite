import { globalSettingsDefault, IGlobalSettings } from '~/shared';
import { ipcAgent } from '~/ui/base';
import { useEventSource } from '~/ui/helpers';

export const globalSettingsModel = new (class {
  globalSettings: IGlobalSettings = globalSettingsDefault;

  getValue<K extends keyof IGlobalSettings>(key: K): IGlobalSettings[K] {
    return this.globalSettings[key];
  }

  writeValue<K extends keyof IGlobalSettings>(
    key: K,
    value: IGlobalSettings[K],
  ) {
    const settings = { ...this.globalSettings, [key]: value };
    ipcAgent.async.config_writeGlobalSettings(settings);
  }
})();

export function useGlobalSettingsModelUpdator() {
  globalSettingsModel.globalSettings = useEventSource(
    ipcAgent.events.config_globalSettingsEvents,
    globalSettingsDefault,
  );
}
