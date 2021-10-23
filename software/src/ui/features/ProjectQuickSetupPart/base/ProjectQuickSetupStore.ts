import produce from 'immer';
import { useEffect } from 'qx';
import {
  compareObjectByJsonStringify,
  copyObjectProps,
  fallbackStandardKeyboardSpec,
  IKermiteStandardKeyboardSpec,
  IProjectLayoutEntry,
  IProjectPackageInfo,
  IStandardFirmwareEntry,
} from '~/shared';
import { UiLocalStorage } from '~/ui/base';
import { StandardFirmwareEditor_ExposedModel } from '~/ui/editors';
import {
  fallbackLayoutGeneratorOptions,
  ILayoutGeneratorOptions,
} from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';
import { createLayoutFromFirmwareSpec } from '~/ui/features/ProjectQuickSetupPart/base/LayoutGenerator';
import { projectQuickSetupStoreHelpers } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStoreHelpers';
import {
  dispatchCoreAction,
  globalSettingsWriter,
  uiActions,
} from '~/ui/store';

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

function createDefaultState(): IState {
  return {
    projectId: '',
    keyboardName: '',
    firmwareConfig: fallbackStandardKeyboardSpec,
    layoutOptions: fallbackLayoutGeneratorOptions,
    isConfigValid: true,
    isConnectionValid: false,
  };
}

const state: IState = createDefaultState();

const readers = {
  emitDraftProjectInfo(): IProjectPackageInfo {
    const { firmwareVariationId, firmwareName } = constants;
    const { projectId, keyboardName, firmwareConfig, layoutOptions } = state;
    const [layout] = createLayoutFromFirmwareSpec(
      firmwareConfig,
      layoutOptions,
    );
    const projectInfo = projectQuickSetupStoreHelpers.createDraftPackageInfo({
      projectId,
      keyboardName,
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
  resetConfigurations() {
    copyObjectProps(state, createDefaultState());
    actions.loadFirmwareConfigToEditor();
  },
  loadFirmwareConfigToEditor() {
    StandardFirmwareEditor_ExposedModel.loadFirmwareConfig(
      state.firmwareConfig,
      true,
    );
  },
  setKeyboardName(keyboardName: string) {
    state.keyboardName = keyboardName;
    state.projectId = projectQuickSetupStoreHelpers.generateUniqueProjectId();
  },
  writeFirmwareConfig(data: IKermiteStandardKeyboardSpec) {
    const changed = !compareObjectByJsonStringify(state.firmwareConfig, data);
    if (changed) {
      state.firmwareConfig = data;
      state.projectId = projectQuickSetupStoreHelpers.generateUniqueProjectId();
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
  async createProfile() {
    const projectInfo = readers.emitDraftProjectInfo();
    const { projectId } = projectInfo;
    await dispatchCoreAction({
      project_saveLocalProjectPackageInfo: projectInfo,
    });
    await globalSettingsWriter.writeValue('globalProjectSpec', {
      origin: 'local',
      projectId,
    });
    await dispatchCoreAction({
      profile_createProfileUnnamed: {
        targetProjectOrigin: 'local',
        targetProjectId: projectId,
        presetSpec: { type: 'blank', layoutName: 'default' },
      },
    });
    uiActions.navigateTo('/assigner');
  },
};

const effects = {
  editDataPersistenceEffect() {
    const storageKey = 'projectQuickSetupEditData';
    const loadedData = UiLocalStorage.readItem(storageKey);
    if (loadedData) {
      copyObjectProps(state, loadedData);
    }
    actions.loadFirmwareConfigToEditor();

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

function executeEffectsOnRender() {
  useEffect(effects.editDataPersistenceEffect, []);

  const { isModified, isValid, editValues } =
    StandardFirmwareEditor_ExposedModel;
  useEffect(() => {
    if (isModified && isValid && state.firmwareConfig !== editValues) {
      actions.writeFirmwareConfig(editValues);
      state.isConfigValid = true;
    }
    if (!isValid) {
      state.isConfigValid = false;
    }
  }, [editValues]);
}

export const projectQuickSetupStore = {
  constants,
  state,
  readers,
  actions,
  executeEffectsOnRender,
};
