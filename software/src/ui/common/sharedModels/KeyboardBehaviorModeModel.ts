import { fallbackKeyboardConfig } from '~/shared';
import { ipcAgent } from '~/ui/common/base';
import { useEventSource } from '~/ui/common/helpers';

interface IKeyboardBehaviorModeModel {
  isSimulatorMode: boolean;
  setSimulatorMode(enabled: boolean): void;
  isMuteMode: boolean;
  setMuteMode(enabled: boolean): void;
}

export function useKeyboardBehaviorModeModel(): IKeyboardBehaviorModeModel {
  const keyboardConfig = useEventSource(
    ipcAgent.events.config_keyboardConfigEvents,
    fallbackKeyboardConfig,
  );

  const setSimulatorMode = async (enabled: boolean) => {
    await ipcAgent.async.config_writeKeyboardConfig({
      isSimulatorMode: enabled,
    });
  };

  const setMuteMode = async (enabled: boolean) => {
    await ipcAgent.async.config_writeKeyboardConfig({ isMuteMode: enabled });
  };

  return {
    isSimulatorMode: keyboardConfig.isSimulatorMode,
    isMuteMode: keyboardConfig.isMuteMode,
    setSimulatorMode,
    setMuteMode,
  };
}
