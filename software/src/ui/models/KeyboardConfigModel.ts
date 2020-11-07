import {
  IKeyboardBehaviorMode,
  IKeyboardLayoutStandard
} from '~defs/ConfigTypes';
import { backendAgent } from '~ui/core';

export class KeyboardConfigModel {
  behaviorMode: IKeyboardBehaviorMode = 'Standalone';
  layoutStandard: IKeyboardLayoutStandard = 'US';

  async loadKeyboardConfig() {
    const keyboardConfig = await backendAgent.getKeyboardConfig();
    const { behaviorMode, layoutStandard } = keyboardConfig;
    this.behaviorMode = behaviorMode;
    this.layoutStandard = layoutStandard;
  }

  writeConfigurationToDevice() {
    const { behaviorMode, layoutStandard } = this;
    backendAgent.writeKeyboardConfig({
      behaviorMode,
      layoutStandard
    });
    if (behaviorMode === 'Standalone') {
      backendAgent.writeKeyMappingToDevice();
    }
  }

  initialize() {
    this.loadKeyboardConfig();
  }
}
