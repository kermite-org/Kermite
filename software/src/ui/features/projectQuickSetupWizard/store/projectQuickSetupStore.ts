import { useEffect } from 'alumina';
import produce from 'immer';
import {
  compareObjectByJsonStringify,
  copyObjectProps,
  fallbackStandardFirmwareConfig,
  getNextFirmwareVariationId,
  IProjectLayoutEntry,
  IProjectPackageInfo,
  IStandardFirmwareConfig,
  IStandardFirmwareEntry,
  validateResourceName,
} from '~/shared';
import { migrateStandardFirmwareConfig } from '~/shared/loaders';
import {
  fallbackLayoutGeneratorOptions,
  ILayoutGeneratorOptions,
  UiLocalStorage,
} from '~/ui/base';
import { createLayoutFromFirmwareSpec } from '~/ui/commonModels/draftLayoutGenerator';
import { StandardFirmwareEditor_ExposedModel } from '~/ui/featureEditors';
import { projectQuickSetupStoreHelpers } from '~/ui/features/projectQuickSetupWizard/store/projectQuickSetupStoreHelpers';
import { dispatchCoreAction, globalSettingsWriter, uiState } from '~/ui/store';

type IState = {
  projectId: string;
  keyboardName: string;
  variationId: string;
  firmwareConfig: IStandardFirmwareConfig;
  layoutOptions: ILayoutGeneratorOptions;
  isConfigValid: boolean;
  rawEditValues: IStandardFirmwareConfig;
};

function createDefaultState(): IState {
  return {
    projectId: '',
    keyboardName: '',
    variationId: '',
    firmwareConfig: fallbackStandardFirmwareConfig,
    layoutOptions: fallbackLayoutGeneratorOptions,
    isConfigValid: true,
    rawEditValues: fallbackStandardFirmwareConfig,
  };
}

const state: IState = createDefaultState();

const readers = {
  get keyboardNameValidationError(): string | undefined {
    return validateResourceName(state.keyboardName, 'keyboard name', true);
  },
  get isFirmwareConfigurationStepValid(): boolean {
    const { isConfigValid, keyboardName } = state;
    const { keyboardNameValidationError } = readers;
    return isConfigValid && !!keyboardName && !keyboardNameValidationError;
  },
  get isTargetDeviceConnected(): boolean {
    const deviceStatus = uiState.core.deviceStatus;
    const { projectId, variationId } = state;
    return (
      deviceStatus.isConnected &&
      deviceStatus.deviceAttrs.projectId === projectId &&
      deviceStatus.deviceAttrs.variationId === variationId
    );
  },
  emitDraftProjectInfo(): IProjectPackageInfo {
    const {
      projectId,
      keyboardName,
      variationId,
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
      firmwareName: 'main',
      variationId,
      standardFirmwareConfig: firmwareConfig,
    };
    const layoutEntry: IProjectLayoutEntry = {
      layoutName: 'main',
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
    state.variationId = getNextFirmwareVariationId([]);
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
    state.variationId = getNextFirmwareVariationId([]);
  },
  writeFirmwareConfig(data: IStandardFirmwareConfig) {
    const changed = !compareObjectByJsonStringify(state.firmwareConfig, data);
    if (changed) {
      state.firmwareConfig = data;
      const currentFirmwareId = state.variationId;
      state.variationId = getNextFirmwareVariationId(
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
        presetSpec: { type: 'blank', layoutName: 'main' },
      },
    });
  },
};

type IPersistData = {
  revision: string;
  projectId: string;
  keyboardName: string;
  variationId: string;
  firmwareConfig: IStandardFirmwareConfig;
  layoutOptions: ILayoutGeneratorOptions;
};
const persistDataRevision = 'QPS2';

const effects = {
  useEditDataPersistence() {
    useEffect(() => {
      const storageKey = 'projectQuickSetupEditData';
      const loadedData = UiLocalStorage.readItem<IPersistData>(storageKey);
      if (loadedData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { revision, ...attrs } = loadedData;
        migrateStandardFirmwareConfig(attrs.firmwareConfig);
        if (revision === persistDataRevision) {
          copyObjectProps(state, attrs);
        }
      }
      actions.loadFirmwareConfigToEditor();

      return () => {
        const {
          projectId,
          keyboardName,
          variationId,
          firmwareConfig,
          layoutOptions,
        } = state;
        const persistData: IPersistData = {
          revision: persistDataRevision,
          projectId,
          keyboardName,
          variationId,
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
      state.rawEditValues = editValues;
    }, [editValues]);
  },
};

export const projectQuickSetupStore = {
  state,
  readers,
  actions,
  effects,
};
