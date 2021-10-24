import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import {
  useDeviceAutoConnectionAutoConnectFunction,
  useDeviceAutoConnectionConnectionStatus,
  useDeviceKeyEventIndicatorModel,
} from '~/ui/pageContent/FirmwareFlashPageContent/parts/DeviceAutoConnectionPart/hooks';

type IDeviceAutoConnectionSectionModel = {
  isConnectionValid: boolean;
  isCommunicationIndicatorActive: boolean;
};

export function useDeviceAutoConnectionSectionModel(): IDeviceAutoConnectionSectionModel {
  const { projectId } = projectQuickSetupStore.state;
  const { firmwareVariationId } = projectQuickSetupStore.constants;

  const targetDeviceSpec = { projectId, firmwareVariationId };

  useDeviceAutoConnectionAutoConnectFunction(targetDeviceSpec);

  const isConnectionValid =
    useDeviceAutoConnectionConnectionStatus(targetDeviceSpec);

  const indicatorState = useDeviceKeyEventIndicatorModel(200);

  projectQuickSetupStore.state.isConnectionValid = isConnectionValid;

  return {
    isConnectionValid,
    isCommunicationIndicatorActive: isConnectionValid && indicatorState,
  };
}
