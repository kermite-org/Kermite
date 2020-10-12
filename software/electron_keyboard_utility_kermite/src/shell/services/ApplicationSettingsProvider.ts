import {
  IApplicationSettings,
  fallabackApplicationSettings
} from '~defs/ConfigTypes';
import { overwriteObjectProps } from '~funcs/Utils';
import { applicationStorage } from './ApplicationStorage';

// 永続化する設定やUI状態などを管理
class ApplicationSettingsProvider {
  private readonly stroageKey = 'applicationSettings';

  _settings: IApplicationSettings = fallabackApplicationSettings;

  getSettings(): IApplicationSettings {
    return this._settings;
  }

  writeSettings(settings: IApplicationSettings) {
    this._settings = settings;
  }

  async initialize() {
    const loaded = applicationStorage.getItem<IApplicationSettings>(
      this.stroageKey
    );
    if (loaded) {
      overwriteObjectProps(this._settings, loaded);
    }
  }

  async terminate() {
    applicationStorage.setItem(this.stroageKey, this._settings);
  }
}
export const applicationSettingsProvider = new ApplicationSettingsProvider();
