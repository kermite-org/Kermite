import {
  IApplicationSettings,
  fallabackApplicationSettings
} from '~shared/defs/ConfigTypes';
import { overwriteObjectProps } from '~shared/funcs/Utils';
import { applicationStorage } from './ApplicationStorage';

// メインプロセスで永続化する設定を管理
// UI側で永続化する設定はui/models/UiStatusModelに格納
export class ApplicationSettingsProvider {
  private readonly stroageKey = 'applicationSettings';

  _settings: IApplicationSettings = fallabackApplicationSettings;

  getSettings(): IApplicationSettings {
    return this._settings;
  }

  writeSettings(settings: IApplicationSettings) {
    this._settings = settings;
  }

  initialize() {
    const loaded = applicationStorage.getItem<IApplicationSettings>(
      this.stroageKey
    );
    if (loaded) {
      overwriteObjectProps(this._settings, loaded);
    }
  }

  terminate() {
    applicationStorage.setItem(this.stroageKey, this._settings);
  }
}
