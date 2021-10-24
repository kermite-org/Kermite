import { useEffect } from 'qx';
import { fallbackProjectPackageInfo, IProjectPackageInfo } from '~/shared';
import {
  IAutoConnectionTargetDeviceSpec,
  useDeviceAutoConnectionAutoConnectFunction,
  useDeviceAutoConnectionConnectionStatus,
  useDeviceKeyEventIndicatorModel,
} from '~/ui/pageContent/FirmwareFlashPageContent/hooks';
import { projectPackagesReader } from '~/ui/store';

type IState = {
  targetDeviceSpec: IAutoConnectionTargetDeviceSpec;
  projectInfo: IProjectPackageInfo;
  isConnectionValid: boolean;
  isCommunicationIndicatorActive: boolean;
};

const state: IState = {
  targetDeviceSpec: {
    projectId: '',
    firmwareVariationId: '',
  },
  projectInfo: fallbackProjectPackageInfo,
  isConnectionValid: false,
  isCommunicationIndicatorActive: false,
};

const readers = {
  get keyboardName(): string {
    return state.projectInfo.keyboardName;
  },
};

function configure(targetDeviceSpec: IAutoConnectionTargetDeviceSpec) {
  useEffect(() => {
    state.targetDeviceSpec = targetDeviceSpec;
    state.projectInfo =
      projectPackagesReader.findProjectInfo(
        undefined,
        targetDeviceSpec.projectId,
      ) || fallbackProjectPackageInfo;
  }, [targetDeviceSpec]);

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
