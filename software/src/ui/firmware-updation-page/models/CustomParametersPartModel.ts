import { ipcAgent, useEventSource, useFetcher2 } from '~/ui/common';
import {
  ICustomParameterModel,
  makeParameterModel,
} from '~/ui/firmware-updation-page/models/CustomParameterModel';

interface ICustomParametersPartModel {
  parameterModels: ICustomParameterModel[];
  definitionUnavailable: boolean;
}

export function useCustomParametersPartModel(): ICustomParametersPartModel {
  const deviceStatus = useEventSource(
    ipcAgent.events.device_keyboardDeviceStatusEvents,
    {
      isConnected: false,
    },
  );

  const parameterValues =
    (deviceStatus.isConnected && deviceStatus.systemParameterValues) ||
    undefined;

  const parameterMaxValues =
    (deviceStatus.isConnected && deviceStatus.systemParameterMaxValues) ||
    undefined;

  const deviceAttrs =
    (deviceStatus.isConnected && deviceStatus.deviceAttrs) || undefined;

  const customDef = useFetcher2(
    () =>
      deviceAttrs &&
      ipcAgent.async.projects_getProjectCustomDefinition(
        deviceAttrs.origin,
        deviceAttrs.projectId,
        deviceAttrs.firmwareVariationName,
      ),
    [deviceAttrs],
  );

  const parameterSpec = customDef?.customParameterSpecs;

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
    definitionUnavailable: deviceStatus.isConnected && !customDef,
  };
}
