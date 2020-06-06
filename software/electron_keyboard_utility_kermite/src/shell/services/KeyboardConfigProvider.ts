import { appGlobal } from './appGlobal';
import { IKeyboardConfig, fallbackKeyboardConfig } from '~defs/ConfigTypes';
import { removeArrayItems } from '~funcs/Utils';

type IStatusListener = (config: Partial<IKeyboardConfig>) => void;

export class KeyboardConfigProvider {
  private readonly storageKey = 'keyboardConfig';

  private _keyboardConfig: IKeyboardConfig = fallbackKeyboardConfig;

  private listeners: IStatusListener[] = [];

  get keyboardConfig() {
    return this._keyboardConfig;
  }

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
    const { behaviorMode, keyboardLanguage } = config;
    if (this.keyboardConfig.behaviorMode !== behaviorMode) {
      this.setStatus({ behaviorMode });
    }
    if (this.keyboardConfig.keyboardLanguage !== keyboardLanguage) {
      this.setStatus({ keyboardLanguage });
    }
  }

  async initialize() {
    this._keyboardConfig =
      appGlobal.applicationStorage.getItem(this.storageKey) ||
      fallbackKeyboardConfig;
  }

  async terminate() {
    appGlobal.applicationStorage.setItem(this.storageKey, this._keyboardConfig);
  }
}
