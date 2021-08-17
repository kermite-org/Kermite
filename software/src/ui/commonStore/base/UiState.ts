import {
  ActionDistributor,
  cloneObject,
  copyObjectProps,
  defaultCoreState,
  ICoreAction,
  ICoreState,
  ICustomFirmwareInfo,
  IGlobalSettings,
  IKeyboardConfig,
  IKeyboardDeviceStatus,
  IProjectPackageInfo,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { IPageSpec } from '~/ui/commonModels/PageTypes';

export type IUiState = {
  core: ICoreState;
  pageSpec: IPageSpec | undefined;
  initialLoading: boolean;
};

export const defaultUiState: IUiState = {
  core: cloneObject(defaultCoreState),
  pageSpec: undefined,
  initialLoading: false,
};

export type IUiAction = Partial<{}>;

export const uiState: IUiState = defaultUiState;

export function dispatchCoreAction(action: ICoreAction) {
  ipcAgent.async.global_dispatchCoreAction(action);
}

export const uiActionDistributor = new ActionDistributor<IUiAction>();

export async function dispatchUiAction(action: IUiAction) {
  await uiActionDistributor.putAction(action);
}

export function commitUiState(diff: Partial<IUiState>) {
  copyObjectProps(uiState, diff);
}

export const uiStateDriverEffect = () => {
  // dispatchCoreAction({ loadAppVersion: 1 });
  // dispatchCoreAction({ greet: { name: 'yamada', age: 20 } });
  return ipcAgent.events.global_coreStateEvents.subscribe((diff) => {
    commitUiState({ core: { ...uiState.core, ...diff } });
    console.log({ uiState });
  });
};

export async function lazyInitializeCoreServices() {
  await ipcAgent.async.global_lazyInitializeServices();
}

export const uiStateReader = {
  get globalSettings(): IGlobalSettings {
    return uiState.core.globalSettings;
  },
  get allProjectPackageInfos(): IProjectPackageInfo[] {
    return uiState.core.allProjectPackageInfos;
  },
  get allCustomFirmwareInfos(): ICustomFirmwareInfo[] {
    return uiState.core.allCustomFirmwareInfos;
  },
  get deviceStatus(): IKeyboardDeviceStatus {
    return uiState.core.deviceStatus;
  },
  get keyboardConfig(): IKeyboardConfig {
    return uiState.core.keyboardConfig;
  },
};
