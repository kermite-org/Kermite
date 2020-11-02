import { fallbackKeyboardConfig, IKeyboardConfig } from '~defs/ConfigTypes';
import { StatusSource } from '~funcs/StatusSource';
import { overwriteObjectProps } from '~funcs/Utils';
import { applicationStorage } from './ApplicationStorage';

// 環境に関連したキーボードの設定を保存する, レイアウト(US/JP)など
export class KeyboardConfigProvider {
  private readonly storageKey = 'keyboardConfig';

  readonly configStatus = new StatusSource<IKeyboardConfig>(
    fallbackKeyboardConfig
  );

  get keyboardConfig() {
    return this.configStatus.value;
  }

  writeKeyboardConfig(config: IKeyboardConfig) {
    const { behaviorMode, layoutStandard } = config;
    if (this.keyboardConfig.behaviorMode !== behaviorMode) {
      this.configStatus.patch({ behaviorMode });
    }
    if (this.keyboardConfig.layoutStandard !== layoutStandard) {
      this.configStatus.patch({ layoutStandard });
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
    this.configStatus.replace(this.loadConfig());
  }

  terminate() {
    applicationStorage.setItem(this.storageKey, this.configStatus.value);
  }
}
