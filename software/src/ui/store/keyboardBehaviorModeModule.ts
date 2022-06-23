import { uiReaders, dispatchCoreAction } from '~/ui/store/base';

export const keyboardBehaviorModeModule = {
  get isSimulatorMode() {
    return uiReaders.keyboardConfig.isSimulatorMode;
  },
  get isMuteMode() {
    return uiReaders.keyboardConfig.isMuteMode;
  },
  setSimulatorMode(enabled: boolean) {
    dispatchCoreAction({
      config_writeKeyboardConfig: { isSimulatorMode: enabled },
    });
  },
  setMuteMode(enabled: boolean) {
    dispatchCoreAction({
      config_writeKeyboardConfig: { isMuteMode: enabled },
    });
  },
};
