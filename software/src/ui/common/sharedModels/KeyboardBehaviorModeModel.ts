import { asyncRerender, Hook } from 'qx';
import { IKeyboardBehaviorMode } from '~/shared';
import { ipcAgent } from '~/ui/common/base';

interface IKeyboardBehaviorModeModel {
  behaviorMode: IKeyboardBehaviorMode;
  setBehaviorMode(mode: IKeyboardBehaviorMode): void;
}

// 複数箇所から利用した場合に別のHookインスタンスになり状態が同期されないため、グローバル変数で状態を共有
let gBehaviorMode: IKeyboardBehaviorMode = 'Standalone';

export function useKeyboardBehaviorModeModel(): IKeyboardBehaviorModeModel {
  Hook.useEffect(() => {
    (async () => {
      const keyboardConfig = await ipcAgent.async.config_getKeyboardConfig();
      gBehaviorMode = keyboardConfig.behaviorMode;
    })();
  }, []);

  const setBehaviorMode = async (behaviorMode: IKeyboardBehaviorMode) => {
    await ipcAgent.async.config_writeKeyboardConfig({ behaviorMode });
    gBehaviorMode = behaviorMode;
    asyncRerender();
  };

  return {
    behaviorMode: gBehaviorMode,
    setBehaviorMode,
  };
}
