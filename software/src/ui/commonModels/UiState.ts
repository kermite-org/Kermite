import {
  ActionDistributor,
  cloneObject,
  copyObjectProps,
  defaultCoreState,
  ICoreState,
  ICustomFirmwareInfo,
  IGlobalSettings,
  IProjectPackageInfo,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { IPageSpec } from '~/ui/commonModels/PageTypes';

export type IUiState = {
  core: ICoreState;
  pageSpec: IPageSpec | undefined;
};

export const defaultUiState: IUiState = {
  core: cloneObject(defaultCoreState),
  pageSpec: undefined,
};

export type IUiAction = Partial<{}>;

export const uiState: IUiState = defaultUiState;

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
};
