import { dispatchCoreAction, uiStateReader } from '~/ui/commonStore';

interface IKeyboardBehaviorModeModel {
  isSimulatorMode: boolean;
  setSimulatorMode(enabled: boolean): void;
  isMuteMode: boolean;
  setMuteMode(enabled: boolean): void;
}

export function useKeyboardBehaviorModeModel(): IKeyboardBehaviorModeModel {
  const { keyboardConfig } = uiStateReader;

  const setSimulatorMode = (enabled: boolean) => {
    dispatchCoreAction({
      writeKeyboardConfig: { partialConfig: { isSimulatorMode: enabled } },
    });
  };

  const setMuteMode = (enabled: boolean) => {
    dispatchCoreAction({
      writeKeyboardConfig: { partialConfig: { isMuteMode: enabled } },
    });
  };

  return {
    isSimulatorMode: keyboardConfig.isSimulatorMode,
    isMuteMode: keyboardConfig.isMuteMode,
    setSimulatorMode,
    setMuteMode,
  };
}
