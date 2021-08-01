import {
  globalSettingsDefault,
  globalSettingsLoadingSchema,
  IGlobalSettings,
} from '~/shared';
import { applicationStorage } from '~/shell/base';
import { createEventPort } from '~/shell/funcs';

export class GlobalSettingsProvider {
  private _globalSettings: IGlobalSettings = globalSettingsDefault;

  getGlobalSettings(): IGlobalSettings {
    if (this._globalSettings === globalSettingsDefault) {
      this._globalSettings = applicationStorage.readItemBasedOnDefault(
        'globalSettings',
        globalSettingsLoadingSchema,
        globalSettingsDefault,
      );
    }
    return this._globalSettings;
  }

  globalConfigEventPort = createEventPort<Partial<IGlobalSettings>>({
    initialValueGetter: () => this.getGlobalSettings(),
  });

  writeGlobalSettings(partialConfig: Partial<IGlobalSettings>) {
    this._globalSettings = {
      ...this._globalSettings,
      ...partialConfig,
    };
    applicationStorage.writeItem('globalSettings', this._globalSettings);
    this.globalConfigEventPort.emit(partialConfig);
  }
}
export const globalSettingsProvider = new GlobalSettingsProvider();
