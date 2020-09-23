import { IKeyboardConfig, fallbackKeyboardConfig } from '~defs/ConfigTypes';
import { removeArrayItems, overwriteObjectProps } from '~funcs/Utils';
import { ApplicationStorage } from './ApplicationStorage';

type IStatusListener = (config: Partial<IKeyboardConfig>) => void;

export class KeyboardConfigProvider {
  private readonly storageKey = 'keyboardConfig';

  private _keyboardConfig: IKeyboardConfig = fallbackKeyboardConfig;

  private listeners: IStatusListener[] = [];

  get keyboardConfig() {
    return this._keyboardConfig;
  }

  constructor(private applicationStorage: ApplicationStorage) {}

  subscribeStatus(listener: IStatusListener) {
    listener(this.keyboardConfig);
    this.listeners.push(listener);
  }

  unsubscribeStatus(listener: IStatusListener) {
    removeArrayItems(this.listeners, listener);
  }

  private setStatus(newStatePartial: Partial<IKeyboardConfig>) {
    this._keyboardConfig = { ...this.keyboardConfig, ...newStatePartial };
    this.listeners.forEach((listener) => listener(newStatePartial));
  }

  writeKeyboardConfig(config: IKeyboardConfig) {
    const { behaviorMode, layoutStandard } = config;
    if (this.keyboardConfig.behaviorMode !== behaviorMode) {
      this.setStatus({ behaviorMode });
    }
    if (this.keyboardConfig.layoutStandard !== layoutStandard) {
      this.setStatus({ layoutStandard });
    }
  }

  private loadConfig(): IKeyboardConfig {
    const config: IKeyboardConfig = { ...fallbackKeyboardConfig };
    const loaded = this.applicationStorage.getItem(this.storageKey);
    if (loaded) {
      overwriteObjectProps(config, loaded);
    }
    return config;
  }

  async initialize() {
    this._keyboardConfig = this.loadConfig();
  }

  async terminate() {
    this.applicationStorage.setItem(this.storageKey, this._keyboardConfig);
  }
}
