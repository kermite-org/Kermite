import { useEffect, useState } from 'qx';
import { SystemParameter } from '~/shared';
import { ipcAgent } from '~/ui/base';
import {
  IRoutingChannelModel,
  ISystemLayoutModel,
} from '~/ui/sharedModels/Interfaces';

interface ISystemParameterModel {
  value: number;
  setValue: (value: number) => void;
}

function useSystemParameterModel(
  parameterIndex: number,
  defaultValue: number,
): ISystemParameterModel {
  const [value, _setValue] = useState(defaultValue);
  useEffect(
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
