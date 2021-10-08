import { IKeyboardDeviceStatus, SystemParameterDefinitions } from '~/shared';
import { ipcAgent } from '~/ui/base';
import {
  ICustomParameterModel,
  makeParameterModel,
} from '~/ui/pages/firmware-update-page/sections/CustomParametersPart/CustomParameterModel';
import { uiReaders } from '~/ui/store';

interface ICustomParametersPartModel {
  parameterModels: ICustomParameterModel[];
  definitionUnavailable: boolean;
  isConnected: boolean;
  resetParameters: () => void;
}

function getParameterModels(
  deviceStatus: IKeyboardDeviceStatus,
): ICustomParameterModel[] {
  if (deviceStatus.isConnected) {
    const {
      systemParameterExposedFlags,
      systemParameterValues,
      systemParameterMaxValues,
    } = deviceStatus;

    const parameterSpec = SystemParameterDefinitions.filter(
      (it) => !(it.slotIndex === 4 || it.slotIndex === 5), // SystemLayoutとRoutingChannelを除外
    ).filter((it) => ((systemParameterExposedFlags >> it.slotIndex) & 1) > 0);

    return parameterSpec.map((spec) =>
      makeParameterModel(
        spec,
        systemParameterValues[spec.slotIndex],
        systemParameterMaxValues[spec.slotIndex],
      ),
    );
  } else {
    return [];
  }
}

export function useCustomParametersPartModel(): ICustomParametersPartModel {
  const { deviceStatus } = uiReaders;
  const { isConnected } = deviceStatus;

  const resetParameters = () => {
    if (isConnected) {
      ipcAgent.async.device_resetParameters();
    }
  };

  return {
    parameterModels: getParameterModels(deviceStatus),
    definitionUnavailable: false,
    isConnected,
    resetParameters,
  };
}
