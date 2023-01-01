import {
  copyObjectProps,
  createFallbackPersistKeyboardLayout,
  createFallbackPersistProfileData,
} from '~/app-shared';
import { diProfileEditor } from './di';
import { AssignerGeneralComponent_OutputPropsSupplier } from './profileEditor';

// interface IProfileEditorStore {
//   readers: {
//     profileName: string;
//     profile: IPersistProfileData;
//     layout: IPersistKeyboardLayout;
//     isModified: boolean;
//     routingPanelVisible: boolean;
//     configurationPanelVisible: boolean;
//   };
//   actions: {
//     loadProfile(itemPath: string): void;
//     saveProfile(): void;
//     unloadProfile(): void;
//     toggleConfigurationPanel(): void;
//     toggleRoutingPanel(): void;
//   };
// }

type IProfileModalPanelType = 'configurationPanel' | 'routingPanel';

function createProfileEditorStore() {
  const fallbackProfile = createFallbackPersistProfileData();
  const fallbackLayout = createFallbackPersistKeyboardLayout();
  const state = {
    itemPath: '',
    profileName: '',
    profile: fallbackProfile,
    layout: fallbackLayout,
    modalPanelType: undefined as IProfileModalPanelType | undefined,
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
    get configurationPanelVisible() {
      return state.modalPanelType === 'configurationPanel';
    },
    get routingPanelVisible() {
      return state.modalPanelType === 'routingPanel';
    },
  };

  const actions = {
    loadProfile(itemPath: string) {
      const [projectId, _, profileName] = itemPath.split('/');
      const profile = diProfileEditor.loadProfile(itemPath);
      const layoutName = profile.referredLayoutName;
      const layoutItemPath = `${projectId}/layout/${layoutName}`;
      const layout = diProfileEditor.loadLayout(layoutItemPath);
      copyObjectProps<Partial<typeof state>>(state, {
        itemPath,
        profileName,
        profile,
        layout,
      });
    },
    unloadProfile() {
      state.itemPath = '';
      state.profileName = '';
      state.profile = fallbackProfile;
      state.layout = fallbackLayout;
      state.modalPanelType = undefined;
    },
    saveProfile() {
      const newProfile =
        AssignerGeneralComponent_OutputPropsSupplier.emitSavingDesign();
      diProfileEditor.saveProfile(state.itemPath, newProfile);
      state.profile = newProfile;
    },
    toggleConfigurationPanel() {
      state.modalPanelType = !state.modalPanelType
        ? 'configurationPanel'
        : undefined;
    },
    toggleRoutingPanel() {
      state.modalPanelType = !state.modalPanelType ? 'routingPanel' : undefined;
    },
    closeModal() {
      state.modalPanelType = undefined;
    },
  };

  return {
    readers,
    actions,
  };
}
export const profileEditorStore = createProfileEditorStore();
