import {
  defaultUiState,
  ICustomFirmwareInfo,
  IProjectPackageInfo,
  IUiState,
} from '~/shared';
import { ipcAgent } from '~/ui/base';

export const uiState: IUiState = defaultUiState;

export const uiStateDriverEffect = () => {
  // dispatchCoreAction({ loadAppVersion: 1 });
  // dispatchCoreAction({ greet: { name: 'yamada', age: 20 } });
  return ipcAgent.events.global_coreStateEvents.subscribe((diff) => {
    uiState.core = { ...uiState.core, ...diff };
    console.log({ uiState });
  });
};

export const uiStateReader = {
  get allProjectPackageInfos(): IProjectPackageInfo[] {
    return uiState.core.allProjectPackageInfos;
  },
  get allCustomFirmwareInfos(): ICustomFirmwareInfo[] {
    return uiState.core.allCustomFirmwareInfos;
  },
};
