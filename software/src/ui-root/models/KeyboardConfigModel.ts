import {
  IKeyboardBehaviorMode,
  IKeyboardLayoutStandard,
} from '@kermite/shared';
import { ipcAgent } from '@kermite/ui';

export class KeyboardConfigModel {
  behaviorMode: IKeyboardBehaviorMode = 'Standalone';
  layoutStandard: IKeyboardLayoutStandard = 'US';

  async loadKeyboardConfig() {
    const keyboardConfig = await ipcAgent.async.config_getKeyboardConfig();
    const { behaviorMode, layoutStandard } = keyboardConfig;
    this.behaviorMode = behaviorMode;
    this.layoutStandard = layoutStandard;
  }

  writeConfigurationToDevice() {
    const { behaviorMode, layoutStandard } = this;
    ipcAgent.async.config_writeKeyboardConfig({
      behaviorMode,
      layoutStandard,
    });
    if (behaviorMode === 'Standalone') {
      ipcAgent.async.config_writeKeyMappingToDevice();
    }
  }

  initialize() {
    this.loadKeyboardConfig();
  }
}
