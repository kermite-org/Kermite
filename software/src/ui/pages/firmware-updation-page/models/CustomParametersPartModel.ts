import { SystemParameterDefinitions } from '~/shared';
import { ipcAgent } from '~/ui/base';
import { uiStateReader } from '~/ui/commonStore';
import {
  ICustomParameterModel,
  makeParameterModel,
} from '~/ui/pages/firmware-updation-page/models/CustomParameterModel';

interface ICustomParametersPartModel {
  parameterModels: ICustomParameterModel[];
  definitionUnavailable: boolean;
  isConnected: boolean;
  resetParameters: () => void;
}

export function useCustomParametersPartModel(): ICustomParametersPartModel {
  const { deviceStatus } = uiStateReader;

  const parameterValues =
    (deviceStatus.isConnected && deviceStatus.systemParameterValues) ||
    undefined;

  const parameterMaxValues =
    (deviceStatus.isConnected && deviceStatus.systemParameterMaxValues) ||
    undefined;

  // const deviceAttrs =
  //   (deviceStatus.isConnected && deviceStatus.deviceAttrs) || undefined;

  // const customDef = useFetcher2(
  //   () =>
  //     deviceAttrs &&
  //     ipcAgent.async.projects_getProjectCustomDefinition(
  //       deviceAttrs.origin,
  //       deviceAttrs.projectId,
  //       deviceAttrs.firmwareVariationName,
  //     ),
  //   [deviceAttrs],
  // );

  const parameterSpec = SystemParameterDefinitions.filter(
    (it) => !(it.slotIndex === 4 || it.slotIndex === 5),
  );

  const isConnected = deviceStatus.isConnected;

  const resetParameters = () => {
    if (isConnected) {
      ipcAgent.async.device_resetParaemters();
    }
  };

  return {
    parameterModels:
      (parameterSpec &&
        parameterValues &&
        parameterMaxValues &&
        parameterSpec.map((spec) =>
          makeParameterModel(
            spec,
            parameterValues[spec.slotIndex],
            parameterMaxValues[spec.slotIndex],
          ),
        )) ||
      [],
    definitionUnavailable: false,
    isConnected,
    resetParameters,
  };
}
