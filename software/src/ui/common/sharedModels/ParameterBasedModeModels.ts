import { Hook } from 'qx';
import { SystemParameter } from '~/shared';
import { ipcAgent } from '~/ui/common';

function useSystemParameterModel(
  parameterIndex: number,
  defaultValue: number,
): {
  value: number;
  setValue: (value: number) => void;
} {
  const [value, _setValue] = Hook.useState(defaultValue);
  Hook.useEffect(
    () =>
      ipcAgent.events.device_keyboardDeviceStatusEvents.subscribe((status) => {
        if (status.systemParameterValues) {
          const newValue = status.systemParameterValues[parameterIndex];
          _setValue(newValue);
        }
      }),
    [],
  );
  const setValue = (newValue: number) => {
    ipcAgent.async.device_setCustomParameterValue(parameterIndex, newValue);
  };
  return {
    value,
    setValue,
  };
}

interface ISystemLayoutModel {
  systemLayoutIndex: number;
  setSystemLayoutIndex(layoutIndex: number): void;
}

export function useSystemLayoutModel(): ISystemLayoutModel {
  const { value, setValue } = useSystemParameterModel(
    SystemParameter.SystemLayout,
    0,
  );
  return {
    systemLayoutIndex: value,
    setSystemLayoutIndex: setValue,
  };
}
interface IRoutingChannelModel {
  routingChannel: number;
  setRoutingChannel(channel: number): void;
}

export function useRoutingChannelModel(): IRoutingChannelModel {
  const { value, setValue } = useSystemParameterModel(
    SystemParameter.WiringMode,
    0,
  );
  return {
    routingChannel: value,
    setRoutingChannel: setValue,
  };
}
