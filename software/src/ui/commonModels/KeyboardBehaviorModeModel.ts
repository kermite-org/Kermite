import { dispatchCoreAction, uiReaders } from '~/ui/commonStore';

interface IKeyboardBehaviorModeModel {
  isSimulatorMode: boolean;
  setSimulatorMode(enabled: boolean): void;
  isMuteMode: boolean;
  setMuteMode(enabled: boolean): void;
}

export function useKeyboardBehaviorModeModel(): IKeyboardBehaviorModeModel {
  const { keyboardConfig } = uiReaders;

  const setSimulatorMode = (enabled: boolean) => {
    dispatchCoreAction({
      config_writeKeyboardConfig: { isSimulatorMode: enabled },
    });
  };

  const setMuteMode = (enabled: boolean) => {
    dispatchCoreAction({
      config_writeKeyboardConfig: { isMuteMode: enabled },
    });
  };

  return {
    isSimulatorMode: keyboardConfig.isSimulatorMode,
    isMuteMode: keyboardConfig.isMuteMode,
    setSimulatorMode,
    setMuteMode,
  };
}
