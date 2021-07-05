import { IKeyboardConfig } from '~/shared';
import { vBoolean, vObject } from '~/shared/modules/SchemaValidationHelper';
import { applicationStorage } from '~/shell/base';
import { createEventPort } from '~/shell/funcs';

// 環境に関連したキーボードの設定を保存する

const keyboardConfigDataSchema = vObject({
  isSimulatorMode: vBoolean(),
  isMuteMode: vBoolean(),
});

const keyboardConfigDefault: IKeyboardConfig = {
  isSimulatorMode: false,
  isMuteMode: false,
};
export class KeyboardConfigProvider {
  internal_changedNotifier = createEventPort<void>();

  getKeyboardConfig(): IKeyboardConfig {
    return applicationStorage.readItemSafe(
      'keyboardConfig',
      keyboardConfigDataSchema,
      keyboardConfigDefault,
    );
  }

  writeKeyboardConfig(config: IKeyboardConfig) {
    applicationStorage.writeItem('keyboardConfig', config);
    // appGlobal.eventBus.emit('keyboardConfigChanged', config);
    this.internal_changedNotifier.emit();
  }
}
