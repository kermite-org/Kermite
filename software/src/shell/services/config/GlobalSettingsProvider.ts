import {
  globalSettingsDefault,
  globalSettingsLoadingSchema,
  IGlobalSettings,
} from '~/shared';
import { applicationStorage } from '~/shell/base';
import { createEventPort } from '~/shell/funcs';
import { checkLocalRepositoryFolder } from '~/shell/projectResources/LocalResourceHelper';

export class GlobalSettingsProvider {
  private _globalSettings: IGlobalSettings = globalSettingsDefault;

  settingsFixerCallback: ((diff: Partial<IGlobalSettings>) => void) | undefined;

  initialize() {
    const settings = applicationStorage.readItemBasedOnDefault(
      'globalSettings',
      globalSettingsLoadingSchema,
      globalSettingsDefault,
    );
    if (settings.localProjectRootFolderPath) {
      if (!checkLocalRepositoryFolder(settings.localProjectRootFolderPath)) {
        console.warn('invalid local repository folder setting');
        settings.localProjectRootFolderPath = '';
      }
    }
    this._globalSettings = settings;
  }

  getGlobalSettings(): IGlobalSettings {
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

    this.settingsFixerCallback?.(partialConfig);
  }
}
export const globalSettingsProvider = new GlobalSettingsProvider();
