import { globalSettingsDefault, IGlobalSettings } from '~/shared';
import { ipcAgent } from '~/ui/base';
import { useEventSource } from '~/ui/helpers';

export const globalSettingsModel = new (class {
  globalSettings: IGlobalSettings = globalSettingsDefault;

  getValue<K extends keyof IGlobalSettings>(key: K): IGlobalSettings[K] {
    return this.globalSettings[key];
  }
})();

export function useGlobalSettingsModelUpdator() {
  globalSettingsModel.globalSettings = useEventSource(
    ipcAgent.events.config_globalSettingsEvents,
    globalSettingsDefault,
  );
}
