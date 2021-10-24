import { useEffect } from 'qx';
import { fallbackProjectPackageInfo, IProjectPackageInfo } from '~/shared';

type IState = {
  projectInfo: IProjectPackageInfo;
  fixedFirmwareVariationId: string | undefined;
  selectedFirmwareVariationId: string | undefined;
  isConnectionValid: boolean;
  isCommunicationIndicatorActive: boolean;
};

const state: IState = {
  projectInfo: fallbackProjectPackageInfo,
  fixedFirmwareVariationId: undefined,
  selectedFirmwareVariationId: undefined,
  isConnectionValid: false,
  isCommunicationIndicatorActive: false,
};

const readers = {
  get keyboardName(): string {
    return state.projectInfo.keyboardName;
  },
};

const effects = {
  useConfigureStore(
    projectInfo: IProjectPackageInfo,
    firmwareVariationId: string | undefined,
  ) {
    useEffect(() => {
      state.projectInfo = projectInfo;
      state.fixedFirmwareVariationId = firmwareVariationId;
      state.selectedFirmwareVariationId = firmwareVariationId;
    }, [projectInfo, firmwareVariationId]);
  },
};

export const firmwareFlashPageContentStore = {
  state,
  readers,
  effects,
};
