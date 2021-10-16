import produce from 'immer';
import {
  copyObjectProps,
  fallbackStandardKeyboardSpec,
  IKermiteStandardKeyboardSpec,
  IProjectPackageInfo,
} from '~/shared';
import { appUi, UiLocalStorage } from '~/ui/base';
import {
  fallbackLayoutGeneratorOptions,
  ILayoutGeneratorOptions,
} from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';
import { projectQuickSetupStoreHelpers } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStoreHelpers';

const constants = {
  firmwareVariationId: '01',
  firmwareName: 'default',
};

type IState = {
  projectId: string;
  keyboardName: string;
  firmwareConfig: IKermiteStandardKeyboardSpec;
  layoutOptions: ILayoutGeneratorOptions;
  isConfigValid: boolean;
  isConnectionValid: boolean;
};

const state: IState = {
  projectId: '',
  keyboardName: '',
  firmwareConfig: fallbackStandardKeyboardSpec,
  layoutOptions: fallbackLayoutGeneratorOptions,
  isConfigValid: false,
  isConnectionValid: false,
};

const readers = {
  emitDraftProjectInfo(): IProjectPackageInfo {
    const { firmwareVariationId, firmwareName } = constants;
    const { projectId, keyboardName, firmwareConfig } = state;
    return projectQuickSetupStoreHelpers.createDraftPackageInfo({
      projectId,
      keyboardName,
      firmwareVariationId,
      firmwareName,
      firmwareConfig,
    });
  },
};

const actions = {
  writeFirmwareConfig(data: IKermiteStandardKeyboardSpec | undefined) {
    if (data) {
      state.firmwareConfig = data;
      state.projectId = projectQuickSetupStoreHelpers.generateUniqueProjectId();
      state.isConfigValid = true;
      appUi.setDebugValue({ projectId: state.projectId });
    } else {
      state.isConfigValid = false;
    }
  },
  writeLayoutOption<K extends keyof ILayoutGeneratorOptions>(
    key: K,
    value: ILayoutGeneratorOptions[K],
  ) {
    state.layoutOptions = produce(state.layoutOptions, (draft) => {
      draft[key] = value;
    });
  },
};

const effects = {
  editDataPersistenceEffect() {
    const storageKey = 'projectQuickSetupEditData';
    const loadedData = UiLocalStorage.readItem(storageKey);
    if (loadedData) {
      copyObjectProps(state, loadedData);
    }
    return () => {
      const { projectId, keyboardName, firmwareConfig } = state;
      const persistData = { projectId, keyboardName, firmwareConfig };
      UiLocalStorage.writeItem(storageKey, persistData);
    };
  },
};

export const projectQuickSetupStore = {
  constants,
  state,
  readers,
  actions,
  effects,
};
