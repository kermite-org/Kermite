import produce from 'immer';
import {
  copyObjectProps,
  fallbackStandardKeyboardSpec,
  IKermiteStandardKeyboardSpec,
  IProjectLayoutEntry,
  IProjectPackageInfo,
  IStandardFirmwareEntry,
} from '~/shared';
import { appUi, UiLocalStorage } from '~/ui/base';
import {
  fallbackLayoutGeneratorOptions,
  ILayoutGeneratorOptions,
} from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';
import { createLayoutFromFirmwareSpec } from '~/ui/features/ProjectQuickSetupPart/base/LayoutGenerator';
import { projectQuickSetupStoreHelpers } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStoreHelpers';
import { dispatchCoreAction } from '~/ui/store';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { projectId, keyboardName, firmwareConfig, layoutOptions } = state;
    const layout = createLayoutFromFirmwareSpec(firmwareConfig, layoutOptions);
    const projectInfo = projectQuickSetupStoreHelpers.createDraftPackageInfo({
      projectId,
      keyboardName: 'MyKeyboard1', // debug
    });
    const firmwareEntry: IStandardFirmwareEntry = {
      type: 'standard',
      firmwareName,
      variationId: firmwareVariationId,
      standardFirmwareConfig: firmwareConfig,
    };
    const layoutEntry: IProjectLayoutEntry = {
      layoutName: 'default',
      data: layout,
    };
    projectInfo.firmwares.push(firmwareEntry);
    projectInfo.layouts.push(layoutEntry);
    return projectInfo;
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
  createProfile() {
    const projectInfo = readers.emitDraftProjectInfo();
    dispatchCoreAction({
      project_saveLocalProjectPackageInfo: projectInfo,
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
      const { projectId, keyboardName, firmwareConfig, layoutOptions } = state;
      const persistData = {
        projectId,
        keyboardName,
        firmwareConfig,
        layoutOptions,
      };
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
