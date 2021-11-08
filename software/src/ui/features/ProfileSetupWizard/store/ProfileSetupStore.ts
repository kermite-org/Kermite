import { useEffect } from 'qx';
import {
  copyObjectProps,
  createPresetKey,
  fallbackProjectPackageInfo,
  getOriginAndProjectIdFromProjectKey,
  getPresetSpecFromPresetKey,
  IProjectPackageInfo,
} from '~/shared';
import { UiLocalStorage } from '~/ui/base';
import {
  dispatchCoreAction,
  globalSettingsWriter,
  projectPackagesReader,
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
  resetConfigurations() {
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
};

type IPersistData = {
  revision: string;
  targetProjectKey: string;
  variationId: string;
  presetKey: string;
};

const effects = {
  useEditDataPersistence() {
    useEffect(() => {
      const storageKey = 'profileSetupWizardData';
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
