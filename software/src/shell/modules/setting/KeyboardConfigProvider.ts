import {
  fallbackKeyboardConfig,
  keyboardConfigLoadingDataSchema,
} from '~/shared';
import { applicationStorage } from '~/shell/base';
import { commitCoreState, coreState, createCoreModule } from '~/shell/global';

export const keyboardConfigModule = createCoreModule({
  config_loadKeyboardConfig() {
    const keyboardConfig = applicationStorage.readItemBasedOnDefault(
      'keyboardConfig',
      keyboardConfigLoadingDataSchema,
      fallbackKeyboardConfig,
    );
    commitCoreState({ keyboardConfig });
  },
  config_writeKeyboardConfig(partialConfig) {
    const keyboardConfig = {
      ...coreState.keyboardConfig,
      ...partialConfig,
    };
    applicationStorage.writeItem('keyboardConfig', keyboardConfig);
    commitCoreState({ keyboardConfig });
  },
});
