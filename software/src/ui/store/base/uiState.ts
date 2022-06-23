import {
  ActionDistributor,
  cloneObject,
  copyObjectProps,
  defaultCoreState,
  ICoreAction,
  ICoreState,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { IPageModelSpec, IPageSpec } from '~/ui/commonModels/PageTypes';

export interface IUiSettings {
  showTestInputArea: boolean;
  showLayersDynamic: boolean;
  showLayerDefaultAssign: boolean;
  siteDpiScale: number;
  showGlobalHint: boolean;
  showSetupNavigationPanel: boolean;
  showProfileAdvancedOptions: boolean;
}

const defaultUiSettings: IUiSettings = {
  showTestInputArea: false,
  showLayersDynamic: false,
  showLayerDefaultAssign: false,
  siteDpiScale: 1.0,
  showGlobalHint: true,
  showSetupNavigationPanel: false,
  showProfileAdvancedOptions: false,
};

export type IUiState = {
  core: ICoreState;
  settings: IUiSettings;
  pageSpec: IPageSpec | undefined;
  pageModalSpec: IPageModelSpec | undefined;
  initialLoading: boolean;
  profileConfigModalVisible: boolean;
  profileRoutingPanelVisible: boolean;
  isLoading: boolean;
};

export const defaultUiState: IUiState = {
  core: cloneObject(defaultCoreState),
  settings: defaultUiSettings,
  pageSpec: undefined,
  pageModalSpec: undefined,
  initialLoading: false,
  profileConfigModalVisible: false,
  profileRoutingPanelVisible: false,
  isLoading: false,
};

export type IUiAction = Partial<{}>;

export const uiState: IUiState = defaultUiState;

export async function dispatchCoreAction(action: ICoreAction) {
  await ipcAgent.async.global_dispatchCoreAction(action);
}

export const uiActionDistributor = new ActionDistributor<IUiAction>();

export async function dispatchUiAction(action: IUiAction) {
  await uiActionDistributor.putAction(action);
}

export function commitUiState(diff: Partial<IUiState>) {
  copyObjectProps(uiState, diff);
}

export function commitUiSettings(diff: Partial<IUiSettings>) {
  commitUiState({
    settings: { ...uiState.settings, ...diff },
  });
}

export function commitCoreStateFromUiSide(diff: Partial<ICoreState>) {
  commitUiState({ core: { ...uiState.core, ...diff } });
}

export const uiStateDriverEffect = () => {
  return ipcAgent.events.global_coreStateEvents.subscribe((diff) => {
    commitUiState({ core: { ...uiState.core, ...diff } });
    // console.log({ uiState });
  });
};

export async function lazyInitializeCoreServices() {
  await ipcAgent.async.global_lazyInitializeServices();
}
