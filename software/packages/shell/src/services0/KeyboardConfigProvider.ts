import {
  fallbackKeyboardConfig,
  IKeyboardConfig,
} from '~shared/defs/ConfigTypes';
import { EventPort } from '~shared/funcs/EventPort';
import { overwriteObjectProps } from '~shared/funcs/Utils';
import { applicationStorage } from './ApplicationStorage';

// 環境に関連したキーボードの設定を保存する, レイアウト(US/JP)など
export class KeyboardConfigProvider {
  private readonly storageKey = 'keyboardConfig';

  private _keyboardConfig: IKeyboardConfig = fallbackKeyboardConfig;

  get keyboardConfig() {
    return this._keyboardConfig;
  }

  readonly statusEventPort = new EventPort<Partial<IKeyboardConfig>>({
    initialValueGetter: () => this._keyboardConfig,
  });

  private setStatus(newStatePartial: Partial<IKeyboardConfig>) {
    this._keyboardConfig = { ...this.keyboardConfig, ...newStatePartial };
    this.statusEventPort.emit(newStatePartial);
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
    const loaded = applicationStorage.getItem(this.storageKey);
    if (loaded) {
      overwriteObjectProps(config, loaded);
    }
    return config;
  }

  initialize() {
    this._keyboardConfig = this.loadConfig();
  }

  terminate() {
    applicationStorage.setItem(this.storageKey, this._keyboardConfig);
  }
}
