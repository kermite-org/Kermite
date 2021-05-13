import { Hook } from 'qx';
import { IKeyboardBehaviorMode } from '~/shared';
import { ipcAgent } from '~/ui/common/base';

interface IKeyboardBehaviorModeModel {
  behaviorMode: IKeyboardBehaviorMode;
  setBehaviorMode(mode: IKeyboardBehaviorMode): void;
}

export function useKeyboardBehaviorModeModel(): IKeyboardBehaviorModeModel {
  const [behaviorMode, _setBehaviorMode] = Hook.useState<IKeyboardBehaviorMode>(
    'Standalone',
  );

  Hook.useEffect(() => {
    (async () => {
      const keyboardConfig = await ipcAgent.async.config_getKeyboardConfig();
      _setBehaviorMode(keyboardConfig.behaviorMode);
    })();
  }, []);

  const setBehaviorMode = async (behaviorMode: IKeyboardBehaviorMode) => {
    await ipcAgent.async.config_writeKeyboardConfig({ behaviorMode });
    const keyboardConfig = await ipcAgent.async.config_getKeyboardConfig();
    _setBehaviorMode(keyboardConfig.behaviorMode);
  };

  return {
    behaviorMode,
    setBehaviorMode,
  };
}
