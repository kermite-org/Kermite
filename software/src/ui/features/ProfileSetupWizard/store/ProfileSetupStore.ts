import { useEffect } from 'qx';
import { copyObjectProps, fallbackProjectPackageInfo } from '~/shared';
import { UiLocalStorage } from '~/ui/base';
import { dispatchCoreAction, globalSettingsWriter } from '~/ui/store';

type IState = {
  projectId: string;
};

function createDefaultState(): IState {
  return {
    projectId: '',
  };
}

const state: IState = createDefaultState();

const readers = {};

const actions = {
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
  projectId: string;
};
const persistDataRevision = 'profileSetupEditDataV1';

const effects = {
  useEditDataPersistence() {
    useEffect(() => {
      const storageKey = 'profileSetupEditData';
      const loadedData = UiLocalStorage.readItem<IPersistData>(storageKey);
      if (loadedData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { revision } = loadedData;
        if (revision === persistDataRevision) {
          copyObjectProps(state, loadedData);
        }
      }

      return () => {
        const { projectId } = state;
        const persistData: IPersistData = {
          revision: persistDataRevision,
          projectId,
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
