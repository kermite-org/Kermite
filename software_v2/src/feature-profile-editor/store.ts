import {
  copyObjectProps,
  createFallbackPersistKeyboardLayout,
  createFallbackPersistProfileData,
  IPersistKeyboardLayout,
  IPersistProfileData,
} from '~/app-shared';
import { diProfileEditor } from './di';
import { AssignerGeneralComponent_OutputPropsSupplier } from './profileEditor';

interface IProfileEditorStore {
  readers: {
    profileName: string;
    profile: IPersistProfileData;
    layout: IPersistKeyboardLayout;
    isModified: boolean;
  };
  actions: {
    loadProfile(itemPath: string): void;
    saveProfile(): void;
    unloadProfile(): void;
  };
}

function createProfileEditorStore(): IProfileEditorStore {
  const fallbackProfile = createFallbackPersistProfileData();
  const fallbackLayout = createFallbackPersistKeyboardLayout();
  const state = {
    itemPath: '',
    profileName: '',
    profile: fallbackProfile,
    layout: fallbackLayout,
  };

  const readers = {
    get profileName() {
      return state.profileName;
    },
    get profile() {
      return state.profile;
    },
    get layout() {
      return state.layout;
    },
    get isModified() {
      return AssignerGeneralComponent_OutputPropsSupplier.isModified;
    },
  };

  const actions = {
    loadProfile(itemPath: string) {
      const [projectId, _, profileName] = itemPath.split('/');
      const profile = diProfileEditor.loadProfile(itemPath);
      const layoutName = profile.referredLayoutName;
      const layoutItemPath = `${projectId}/layout/${layoutName}`;
      const layout = diProfileEditor.loadLayout(layoutItemPath);
      copyObjectProps(state, { itemPath, profileName, profile, layout });
    },
    unloadProfile() {
      state.itemPath = '';
      state.profileName = '';
      state.profile = fallbackProfile;
      state.layout = fallbackLayout;
    },
    saveProfile() {
      const newProfile =
        AssignerGeneralComponent_OutputPropsSupplier.emitSavingDesign();
      diProfileEditor.saveProfile(state.itemPath, newProfile);
      state.profile = newProfile;
    },
  };

  return {
    readers,
    actions,
  };
}
export const profileEditorStore = createProfileEditorStore();
