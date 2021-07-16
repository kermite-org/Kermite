import {
  globalSettingsDefault,
  globalSettingsSchema,
  IGlobalSettings,
} from '~/shared';
import { applicationStorage } from '~/shell/base';

export namespace GlobalSettingsProvider {
  export function getGlobalSettings(): IGlobalSettings {
    return applicationStorage.readItemBasedOnDefault(
      'globalSettings',
      globalSettingsSchema,
      globalSettingsDefault,
    );
  }

  export function writeGlobalSettings(settings: IGlobalSettings) {
    return applicationStorage.writeItem('globalSettings', settings);
  }
}
