import { IKeyboardBehaviorMode } from '~/shared';
import { ipcAgent, modalAlertTop } from '~/ui/common';

export class KeyboardConfigModel {
  behaviorMode: IKeyboardBehaviorMode = 'Standalone';

  async loadKeyboardConfig() {
    const keyboardConfig = await ipcAgent.async.config_getKeyboardConfig();
    const { behaviorMode } = keyboardConfig;
    this.behaviorMode = behaviorMode;
  }

  async writeConfigurationToDevice() {
    const { behaviorMode } = this;
    await ipcAgent.async.config_writeKeyboardConfig({
      behaviorMode,
    });
    if (behaviorMode === 'Standalone') {
      const done = await ipcAgent.async.config_writeKeyMappingToDevice();
      // todo: トーストにする
      if (done) {
        await modalAlertTop('write succeeded.');
      } else {
        await modalAlertTop('write failed.');
      }
    }
  }

  private initialized = false;
  initialize() {
    if (!this.initialized) {
      this.loadKeyboardConfig();
      this.initialized = true;
    }
  }
}

export const keyboardConfigModel = new KeyboardConfigModel();
