import { fallbackProjectPackageInfo, IProjectPackageInfo } from '~/shared';
import {
  useDeviceAutoConnectionAutoConnectFunction,
  useDeviceAutoConnectionConnectionStatus,
  useDeviceKeyEventIndicatorModel,
} from '~/ui/pageContent/FirmwareFlashPageContent/hooks';

type IState = {
  projectInfo: IProjectPackageInfo;
  firmwareVariationId: string | undefined;
  isConnectionValid: boolean;
  isCommunicationIndicatorActive: boolean;
};

const state: IState = {
  projectInfo: fallbackProjectPackageInfo,
  firmwareVariationId: undefined,
  isConnectionValid: false,
  isCommunicationIndicatorActive: false,
};

const readers = {
  get keyboardName(): string {
    return state.projectInfo.keyboardName;
  },
};

function configure(
  projectInfo: IProjectPackageInfo,
  firmwareVariationId: string | undefined,
) {
  state.projectInfo = projectInfo;
  state.firmwareVariationId = firmwareVariationId;

  const targetDeviceSpec = {
    projectId: projectInfo.projectId,
    firmwareVariationId,
  };

  useDeviceAutoConnectionAutoConnectFunction(targetDeviceSpec);
  const isConnectionValid =
    useDeviceAutoConnectionConnectionStatus(targetDeviceSpec);
  const isIndicatorActive = useDeviceKeyEventIndicatorModel(200);
  state.isConnectionValid = isConnectionValid;
  state.isCommunicationIndicatorActive = isConnectionValid && isIndicatorActive;
}

export const firmwareFlashPageContentStore = {
  state,
  readers,
  configure,
};
