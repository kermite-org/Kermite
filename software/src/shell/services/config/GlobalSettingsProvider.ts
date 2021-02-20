import { IGlobalSettings } from '~/shared';
import { applicationStorage } from '~/shell/base';

export namespace GlobalSettingsProvider {
  export function getGlobalSettings(): IGlobalSettings {
    return applicationStorage.getItem0('globalSettings');
  }

  export function writeGlobalSettings(settings: IGlobalSettings) {
    return applicationStorage.setItem0('globalSettings', settings);
  }
}
