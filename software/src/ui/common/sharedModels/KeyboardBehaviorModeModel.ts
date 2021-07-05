import { asyncRerender, Hook } from 'qx';
import { ipcAgent } from '~/ui/common/base';

interface IKeyboardBehaviorModeModel {
  isSimulatorMode: boolean;
  setSimulatorMode(enabled: boolean): void;
  isMuteMode: boolean;
  setMuteMode(enabled: boolean): void;
}

// 複数箇所から利用した場合に別のHookインスタンスになり状態が同期されないため、グローバル変数で状態を共有
const gModeState = new (class {
  isSimulatorMode: boolean = false;
  isMuteMode: boolean = false;
})();

export function useKeyboardBehaviorModeModel(): IKeyboardBehaviorModeModel {
  Hook.useEffect(() => {
    (async () => {
      const keyboardConfig = await ipcAgent.async.config_getKeyboardConfig();
      gModeState.isSimulatorMode = keyboardConfig.isSimulatorMode;
      gModeState.isMuteMode = keyboardConfig.isMuteMode;
    })();
  }, []);

  const setSimulatorMode = async (enabled: boolean) => {
    gModeState.isSimulatorMode = enabled;
    await ipcAgent.async.config_writeKeyboardConfig(gModeState);
    asyncRerender();
  };

  const setMuteMode = async (enabled: boolean) => {
    gModeState.isMuteMode = enabled;
    await ipcAgent.async.config_writeKeyboardConfig(gModeState);
    asyncRerender();
  };

  return {
    isSimulatorMode: gModeState.isSimulatorMode,
    isMuteMode: gModeState.isMuteMode,
    setSimulatorMode,
    setMuteMode,
  };
}
