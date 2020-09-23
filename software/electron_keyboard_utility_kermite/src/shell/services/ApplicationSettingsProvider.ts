import {
  IApplicationSettings,
  fallabackApplicationSettings
} from '~defs/ConfigTypes';
import { ApplicationStorage } from './ApplicationStorage';

export class ApplicationSettingsProvider {
  private readonly stroageKey = 'applicationSettings';

  _settings: IApplicationSettings = fallabackApplicationSettings;

  constructor(private applicationStorage: ApplicationStorage) {}

  getSettings(): IApplicationSettings {
    return this._settings;
  }

  writeSettings(settings: IApplicationSettings) {
    this._settings = settings;
  }

  async initialize() {
    this._settings =
      this.applicationStorage.getItem(this.stroageKey) ||
      fallabackApplicationSettings;
  }

  async terminate() {
    this.applicationStorage.setItem(this.stroageKey, this._settings);
  }
}
