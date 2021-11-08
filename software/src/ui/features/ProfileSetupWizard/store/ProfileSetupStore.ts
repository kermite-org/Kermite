import { useEffect } from 'qx';
import { copyObjectProps, fallbackProjectPackageInfo } from '~/shared';
import { UiLocalStorage } from '~/ui/base';
import { dispatchCoreAction, globalSettingsWriter } from '~/ui/store';

type IState = {
  targetProjectKey: string;
  variationId: string;
};

function createDefaultState(): IState {
  return {
    targetProjectKey: '',
    variationId: '',
  };
}

const state: IState = createDefaultState();

const readers = {};

const actions = {
  setTargetProjectKey(projectKey: string) {
    state.targetProjectKey = projectKey;
  },
  setVariationId(variationId: string) {
    state.variationId = variationId;
  },
  resetConfigurations() {
    copyObjectProps(state, createDefaultState());
  },
  async createProfile() {
    const projectInfo = fallbackProjectPackageInfo; // development dummy
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
  },
};

type IPersistData = {
  revision: string;
  targetProjectKey: string;
  variationId: string;
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
        const { targetProjectKey, variationId } = state;
        const persistData: IPersistData = {
          revision,
          targetProjectKey,
          variationId,
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
