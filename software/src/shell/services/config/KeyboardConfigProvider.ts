import { IKeyboardConfig } from '~/shared';
import { applicationStorage } from '~/shell/base';
import { EventPort } from '~/shell/funcs';

// 環境に関連したキーボードの設定を保存する, レイアウト(US/JP)など
export class KeyboardConfigProvider {
  internal_changedNotifier = new EventPort<void>();

  getKeyboardConfig(): IKeyboardConfig {
    return applicationStorage.getItem('keyboardConfig');
  }

  writeKeyboardConfig(config: IKeyboardConfig) {
    applicationStorage.setItem('keyboardConfig', config);
    // appGlobal.eventBus.emit('keyboardConfigChanged', config);
    this.internal_changedNotifier.emit();
  }
}
