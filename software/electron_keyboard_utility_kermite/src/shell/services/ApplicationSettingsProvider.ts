import { appGlobal } from './appGlobal';
import {
  IApplicationSettings,
  fallabackApplicationSettings
} from '~defs/ConfigTypes';

export class ApplicationSettingsProvider {
  private readonly stroageKey = 'applicationSettings';

  _settings: IApplicationSettings = fallabackApplicationSettings;

  getSettings(): IApplicationSettings {
    return this._settings;
  }

  writeSettings(settings: IApplicationSettings) {
    this._settings = settings;
  }

  async initialize() {
    this._settings =
      appGlobal.applicationStorage.getItem(this.stroageKey) ||
      fallabackApplicationSettings;
  }

  async terminate() {
    appGlobal.applicationStorage.setItem(this.stroageKey, this._settings);
  }
}
