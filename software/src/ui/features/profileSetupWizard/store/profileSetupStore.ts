import { useEffect } from 'alumina';
import {
  copyObjectProps,
  createPresetKey,
  createProjectKey,
  fallbackProjectPackageInfo,
  fileExtensions,
  getOriginAndProjectIdFromProjectKey,
  getPresetSpecFromPresetKey,
  IFileReadHandle,
  IProjectPackageInfo,
} from '~/shared';
import { ipcAgent, UiLocalStorage } from '~/ui/base';
import {
  dispatchCoreAction,
  globalSettingsWriter,
  projectPackagesActions,
  projectPackagesReader,
  uiReaders,
  uiState,
} from '~/ui/store';

type IState = {
  targetProjectKey: string;
  variationId: string;
  presetKey: string;
};

function createDefaultState(): IState {
  return {
    targetProjectKey: '',
    variationId: '',
    presetKey: '',
  };
}

const state: IState = createDefaultState();

const constants = {
  persistDataStorageKey: 'profileSetupWizardData',
};

const readers = {
  get targetProjectInfo(): IProjectPackageInfo {
    const { origin, projectId } = getOriginAndProjectIdFromProjectKey(
      state.targetProjectKey,
    );
    return (
      projectPackagesReader.findProjectInfo(origin, projectId) ||
      fallbackProjectPackageInfo
    );
  },
  get isTargetDeviceConnected(): boolean {
    const deviceStatus = uiState.core.deviceStatus;
    const { targetProjectKey, variationId } = state;
    const { projectId } = getOriginAndProjectIdFromProjectKey(targetProjectKey);
    return (
      deviceStatus.isConnected &&
      deviceStatus.deviceAttrs.projectId === projectId &&
      deviceStatus.deviceAttrs.variationId === variationId
    );
  },
};

const actions = {
  setTargetProjectKey(projectKey: string) {
    state.targetProjectKey = projectKey;
    const projectInfo = readers.targetProjectInfo;
    state.variationId = projectInfo.firmwares[0]?.variationId || '';
    state.presetKey = createPresetKey(
      'blank',
      projectInfo.layouts[0]?.layoutName,
    );
  },
  setVariationId(variationId: string) {
    state.variationId = variationId;
  },
  setPresetKey(presetKey: string) {
    state.presetKey = presetKey;
  },
  clearPersistState() {
    const storageKey = constants.persistDataStorageKey;
    UiLocalStorage.removeItem(storageKey);
    copyObjectProps(state, createDefaultState());
  },
  async createProfile() {
    const { targetProjectKey, presetKey } = state;
    const { origin, projectId } =
      getOriginAndProjectIdFromProjectKey(targetProjectKey);
    await globalSettingsWriter.writeValue('globalProjectSpec', {
      origin,
      projectId,
    });
    const presetSpec = getPresetSpecFromPresetKey(presetKey);
    await dispatchCoreAction({
      profile_createProfileUnnamed: {
        targetProjectOrigin: origin,
        targetProjectId: projectId,
        presetSpec,
      },
    });
  },
  async handleLocalPackageFileDrop(fileHandle: IFileReadHandle) {
    const loadedProjectId = await projectPackagesActions.importLocalPackageFile(
      fileHandle,
    );
    if (
      loadedProjectId &&
      uiReaders.allProjectPackageInfos.find(
        (it) => it.origin === 'local' && it.projectId === loadedProjectId,
      )
    ) {
      state.targetProjectKey = createProjectKey('local', loadedProjectId);
    }
  },
  async handleSelectLocalPackageToImport() {
    const fileHandle = await ipcAgent.async.file_getOpenJsonFilePathWithDialog(
      fileExtensions.package,
    );
    if (fileHandle) {
      await actions.handleLocalPackageFileDrop(fileHandle);
    }
  },
};

type IPersistData = {
  revision: string;
  targetProjectKey: string;
  variationId: string;
  presetKey: string;
};

const effects = {
  useEditDataPersistence() {
    const storageKey = constants.persistDataStorageKey;
    useEffect(() => {
      const revision = 'v1';
      const loadedData = UiLocalStorage.readItem<IPersistData>(storageKey);
      if (loadedData) {
        if (loadedData.revision === revision) {
          copyObjectProps(state, loadedData);
        }
      }

      return () => {
        const { targetProjectKey, variationId, presetKey } = state;
        const persistData: IPersistData = {
          revision,
          targetProjectKey,
          variationId,
          presetKey,
        };
        UiLocalStorage.writeItem(storageKey, persistData);
      };
    }, []);
  },
};

export const profileSetupStore = {
  state,
  readers,
  actions,
  effects,
};
