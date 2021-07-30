import {
  fallbackKeyboardConfig,
  IKeyboardConfig,
  keyboardConfigLoadingDataSchema,
} from '~/shared';
import { appGlobal, applicationStorage } from '~/shell/base';
import { createEventPort } from '~/shell/funcs';

export class KeyboardConfigProvider {
  private keyboardConfig: IKeyboardConfig = fallbackKeyboardConfig;

  constructor() {
    appGlobal.getSimulatorMode = () => {
      if (this.keyboardConfig === fallbackKeyboardConfig) {
        this.loadFromBackingStore();
      }
      return this.keyboardConfig.isSimulatorMode;
    };
  }

  keyboardConfigEventPort = createEventPort<Partial<IKeyboardConfig>>({
    onFirstSubscriptionStarting: () => this.loadFromBackingStore(),
    onLastSubscriptionEnded: () => this.saveToBackingStore(),
    initialValueGetter: () => this.keyboardConfig,
  });

  writeKeyboardConfig(partialConfig: Partial<IKeyboardConfig>) {
    this.keyboardConfig = {
      ...this.keyboardConfig,
      ...partialConfig,
    };
    this.keyboardConfigEventPort.emit(partialConfig);
  }

  loadFromBackingStore() {
    this.keyboardConfig = applicationStorage.readItemBasedOnDefault(
      'keyboardConfig',
      keyboardConfigLoadingDataSchema,
      fallbackKeyboardConfig,
    );
  }

  saveToBackingStore() {
    applicationStorage.writeItem('keyboardConfig', this.keyboardConfig);
  }
}
