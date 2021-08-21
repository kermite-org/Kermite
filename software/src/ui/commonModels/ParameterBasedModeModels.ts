import { SystemParameter } from '~/shared';
import { ipcAgent } from '~/ui/base';
import {
  IRoutingChannelModel,
  ISystemLayoutModel,
} from '~/ui/commonModels/Interfaces';
import { uiStateReader } from '~/ui/commonStore';

interface ISystemParameterModel {
  value: number;
  setValue: (value: number) => void;
}

function useSystemParameterModel(
  parameterIndex: number,
  defaultValue: number,
): ISystemParameterModel {
  const _value =
    uiStateReader.deviceStatus.systemParameterValues?.[parameterIndex];
  const value = typeof _value === 'number' ? _value : defaultValue;
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
