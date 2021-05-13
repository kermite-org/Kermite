import { Hook } from 'qx';
import { SystemParameter } from '~/shared/defs/SystemCommand';
import { ipcAgent } from '~/ui/common';

interface ISystemLayoutModel {
  systemLayoutIndex: number;
  setSystemLayoutIndex(layoutIndex: number): void;
}

export function useSystemLayoutModel(): ISystemLayoutModel {
  const [systemLayoutIndex, _setSystemLayoutIndex] = Hook.useState(0);
  Hook.useEffect(
    () =>
      ipcAgent.events.device_keyboardDeviceStatusEvents.subscribe((status) => {
        if (status.systemParameterValues) {
          const newValue =
            status.systemParameterValues[SystemParameter.SystemLayout];
          _setSystemLayoutIndex(newValue);
        }
      }),
    [],
  );
  const setSystemLayoutIndex = (layoutIndex: number) => {
    ipcAgent.async.device_setCustomParameterValue(
      SystemParameter.SystemLayout,
      layoutIndex,
    );
  };
  return {
    systemLayoutIndex,
    setSystemLayoutIndex,
  };
}
