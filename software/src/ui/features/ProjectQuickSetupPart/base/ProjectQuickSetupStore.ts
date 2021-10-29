import produce from 'immer';
import { useEffect } from 'qx';
import {
  compareObjectByJsonStringify,
  copyObjectProps,
  fallbackStandardKeyboardSpec,
  getNextFirmwareId,
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
  firmwareName: 'default',
};

type IState = {
  projectId: string;
  keyboardName: string;
  firmwareVariationId: string;
  firmwareConfig: IKermiteStandardKeyboardSpec;
  layoutOptions: ILayoutGeneratorOptions;
  isConfigValid: boolean;
  isConnectionValid: boolean;
  isFirmwareFlashPanelOpen: boolean;
};

function createDefaultState(): IState {
  return {
    projectId: '',
    keyboardName: '',
    firmwareVariationId: '',
    firmwareConfig: fallbackStandardKeyboardSpec,
    layoutOptions: fallbackLayoutGeneratorOptions,
    isConfigValid: true,
    isConnectionValid: false,
    isFirmwareFlashPanelOpen: false,
  };
}

const state: IState = createDefaultState();

const readers = {
  emitDraftProjectInfo(): IProjectPackageInfo {
    const { firmwareName } = constants;
    const {
      projectId,
      keyboardName,
      firmwareVariationId,
      firmwareConfig,
      layoutOptions,
    } = state;
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
    state.projectId = projectQuickSetupStoreHelpers.generateUniqueProjectId();
    state.firmwareVariationId = getNextFirmwareId([]);
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
    state.firmwareVariationId = getNextFirmwareId([]);
  },
  writeFirmwareConfig(data: IKermiteStandardKeyboardSpec) {
    const changed = !compareObjectByJsonStringify(state.firmwareConfig, data);
    if (changed) {
      state.firmwareConfig = data;
      const currentFirmwareId = state.firmwareVariationId;
      state.firmwareVariationId = getNextFirmwareId(
        (currentFirmwareId && [currentFirmwareId]) || [],
      );
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
  openFirmwareFlashPanel() {
    state.isFirmwareFlashPanelOpen = true;
  },
  closeFirmwareFlashPanel() {
    state.isFirmwareFlashPanelOpen = false;
  },
};

type IPersistData = {
  revision: string;
  projectId: string;
  keyboardName: string;
  firmwareVariationId: string;
  firmwareConfig: IKermiteStandardKeyboardSpec;
  layoutOptions: ILayoutGeneratorOptions;
};
const persistDataRevision = 'QPS1';

const effects = {
  useEditDataPersistence() {
    useEffect(() => {
      const storageKey = 'projectQuickSetupEditData';
      const loadedData = UiLocalStorage.readItem<IPersistData>(storageKey);
      if (loadedData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { revision, ...attrs } = loadedData;
        if (revision === persistDataRevision) {
          copyObjectProps(state, attrs);
        }
      }
      actions.loadFirmwareConfigToEditor();

      return () => {
        const {
          projectId,
          keyboardName,
          firmwareVariationId,
          firmwareConfig,
          layoutOptions,
        } = state;
        const persistData: IPersistData = {
          revision: persistDataRevision,
          projectId,
          keyboardName,
          firmwareVariationId,
          firmwareConfig,
          layoutOptions,
        };
        UiLocalStorage.writeItem(storageKey, persistData);
      };
    }, []);
  },
  useReflectEditFirmwareConfigToStore() {
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
  },
};

export const projectQuickSetupStore = {
  constants,
  state,
  readers,
  actions,
  effects,
};
