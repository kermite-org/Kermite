import {
  fallbackKeyboardConfig,
  IKeyboardConfig,
  keyboardConfigLoadingDataSchema,
} from '~/shared';
import { appGlobal, applicationStorage } from '~/shell/base';
import { createEventPort } from '~/shell/funcs';

export class KeyboardConfigProvider {
  private _keyboardConfig: IKeyboardConfig = fallbackKeyboardConfig;

  private get keyboardConfig(): IKeyboardConfig {
    if (this._keyboardConfig === fallbackKeyboardConfig) {
      this._keyboardConfig = applicationStorage.readItemBasedOnDefault(
        'keyboardConfig',
        keyboardConfigLoadingDataSchema,
        fallbackKeyboardConfig,
      );
    }
    return this._keyboardConfig;
  }

  constructor() {
    appGlobal.getSimulatorMode = () => this.keyboardConfig.isSimulatorMode;
  }

  keyboardConfigEventPort = createEventPort<Partial<IKeyboardConfig>>({
    initialValueGetter: () => this.keyboardConfig,
  });

  writeKeyboardConfig(partialConfig: Partial<IKeyboardConfig>) {
    this._keyboardConfig = {
      ...this._keyboardConfig,
      ...partialConfig,
    };
    applicationStorage.writeItem('keyboardConfig', this._keyboardConfig);
    this.keyboardConfigEventPort.emit(partialConfig);
  }
}
