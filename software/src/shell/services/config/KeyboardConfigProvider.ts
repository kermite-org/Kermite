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
  private keyboardConfig: IKeyboardConfig = undefined!;

  keyboardConfigEventPort = createEventPort<Partial<IKeyboardConfig>>({
    onFirstSubscriptionStarting: () => this.loadFromBackingStore(),
    onLastSubscriptionEnded: () => this.saveToBackingStore(),
    initialValueGetter: () => this.keyboardConfig,
  });

  getKeyboardConfig(): IKeyboardConfig {
    if (!this.keyboardConfig) {
      this.loadFromBackingStore();
    }
    return this.keyboardConfig;
  }

  writeKeyboardConfig(partialConfig: Partial<IKeyboardConfig>) {
    this.keyboardConfig = {
      ...this.keyboardConfig,
      ...partialConfig,
    };
    this.keyboardConfigEventPort.emit(partialConfig);
  }

  loadFromBackingStore() {
    this.keyboardConfig = applicationStorage.readItemSafe(
      'keyboardConfig',
      keyboardConfigDataSchema,
      keyboardConfigDefault,
    );
  }

  saveToBackingStore() {
    applicationStorage.writeItem('keyboardConfig', this.keyboardConfig);
  }
}
