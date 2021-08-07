import {
  globalSettingsDefault,
  globalSettingsLoadingSchema,
  IGlobalSettings,
} from '~/shared';
import { appEnv, applicationStorage } from '~/shell/base';
import { createEventPort, pathResolve } from '~/shell/funcs';
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

  get globalSettings(): IGlobalSettings {
    return this._globalSettings;
  }

  globalConfigEventPort = createEventPort<Partial<IGlobalSettings>>({
    initialValueGetter: () => this._globalSettings,
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

  getLocalRepositoryDir() {
    const settings = this.getGlobalSettings();
    if (settings.developerMode && settings.useLocalResouces) {
      if (appEnv.isDevelopment) {
        return pathResolve('../');
      } else {
        return settings.localProjectRootFolderPath;
      }
    }
    return undefined;
  }
}
export const globalSettingsProvider = new GlobalSettingsProvider();
