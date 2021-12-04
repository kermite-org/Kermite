import { useEffect } from 'alumina';
import {
  copyObjectProps,
  createPresetKey,
  createProjectKey,
  fallbackProjectPackageInfo,
  getFileBaseNameFromFilePath,
  getOriginAndProjectIdFromProjectKey,
  getPresetSpecFromPresetKey,
  IProjectPackageInfo,
} from '~/shared';
import { ipcAgent, UiLocalStorage } from '~/ui/base';
import { modalConfirm, modalError } from '~/ui/components';
import {
  dispatchCoreAction,
  globalSettingsWriter,
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

const actionsImpl = {
  async importLocalPackageFile(filePath: string) {
    if (!filePath?.endsWith('.kmpkg.json')) {
      await modalError(
        'Invalid target file. Only .kmpkg.json file can be loaded.',
      );
      return;
    }
    const packageName = getFileBaseNameFromFilePath(filePath, '.kmpkg.json');
    const fileContent = (await ipcAgent.async.file_loadJsonFileContent(
      filePath,
    )) as { projectId: string };

    const loadedProjectId = fileContent.projectId;
    if (!loadedProjectId) {
      await modalError('invalid file content');
      return;
    }

    const existingLocalPackages = uiReaders.allProjectPackageInfos.filter(
      (it) => it.origin === 'local' && !it.isDraft,
    );

    const sameIdPackage = existingLocalPackages.find(
      (it) =>
        it.projectId === loadedProjectId && it.packageName !== packageName,
    );

    if (sameIdPackage) {
      await modalError(
        `Cannot add package due to projectId duplication. \nLocal package ${sameIdPackage.packageName} has the same projectId as of this.`,
      );
      return;
    }

    const sameNamePackage = existingLocalPackages.find(
      (it) => it.packageName === packageName,
    );

    if (sameNamePackage) {
      const ok = await modalConfirm({
        message: `Existing local package ${packageName} is overwritten. Are you ok?`,
        caption: 'import local package',
      });
      if (!ok) {
        return;
      }
    }
    await dispatchCoreAction({ project_addLocalProjectFromFile: { filePath } });

    if (
      uiReaders.allProjectPackageInfos.find(
        (it) => it.origin === 'local' && it.projectId === loadedProjectId,
      )
    ) {
      state.targetProjectKey = createProjectKey('local', loadedProjectId);
    }
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
  async handleLocalPackageFileDrop(filePath: string) {
    await actionsImpl.importLocalPackageFile(filePath);
  },
  async handleSelectLocalPackageToImport() {
    const filePath = await ipcAgent.async.file_getOpenJsonFilePathWithDialog();
    if (filePath) {
      await actionsImpl.importLocalPackageFile(filePath);
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
