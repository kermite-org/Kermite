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

const actions = {
  configure(
    projectInfo: IProjectPackageInfo,
    firmwareVariationId: string | undefined,
  ) {
    state.projectInfo = projectInfo;
    state.fixedFirmwareVariationId = firmwareVariationId;
    state.selectedFirmwareVariationId = firmwareVariationId;
  },
};

export const firmwareFlashPageContentStore = {
  state,
  readers,
  actions,
};
