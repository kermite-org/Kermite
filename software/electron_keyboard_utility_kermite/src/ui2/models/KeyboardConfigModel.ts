import { backendAgent } from './dataSource/ipc';
import { appUi } from './appGlobal';
import { IKeyboardBehaviorMode, IKeyboardLanguage } from '~defs/ConfigTypes';

export class KeyboardConfigModel {
  behaviorMode: IKeyboardBehaviorMode = 'Standalone';
  keyboardLanguage: IKeyboardLanguage = 'US';

  async loadKeyboardConfig() {
    const keyboardConfig = await backendAgent.getKeyboardConfig();
    const { behaviorMode, keyboardLanguage } = keyboardConfig;
    this.behaviorMode = behaviorMode;
    this.keyboardLanguage = keyboardLanguage;
    appUi.rerender();
  }

  writeConfigurationToDevice() {
    const { behaviorMode, keyboardLanguage } = this;
    backendAgent.writeKeyboardConfig({ behaviorMode, keyboardLanguage });
    if (behaviorMode === 'Standalone') {
      backendAgent.writeKeyMappingToDevice();
    }
  }

  intialize() {
    this.loadKeyboardConfig();
  }

  finalize() {}
}
