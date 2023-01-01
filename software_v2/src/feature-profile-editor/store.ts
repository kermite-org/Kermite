import {
  copyObjectPropsPartial,
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
    showLayersDynamic: false,
    showLayerDefaultAssign: false,
    showProfileAdvancedOptions: false,
    showTestInputArea: false,
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
    get showLayersDynamic() {
      return state.showLayersDynamic;
    },
    get showLayerDefaultAssign() {
      return state.showLayerDefaultAssign;
    },
    get showProfileAdvancedOptions() {
      return state.showProfileAdvancedOptions;
    },
    get showTestInputArea() {
      return state.showTestInputArea;
    },
  };

  const actions = {
    loadProfile(itemPath: string) {
      const [projectId, _, profileName] = itemPath.split('/');
      const profile = diProfileEditor.loadProfile(itemPath);
      const layoutName = profile.referredLayoutName;
      const layoutItemPath = `${projectId}/layout/${layoutName}`;
      const layout = diProfileEditor.loadLayout(layoutItemPath);
      copyObjectPropsPartial(state, { itemPath, profileName, profile, layout });
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
    openConfigurationPanel() {
      state.modalPanelType = !state.modalPanelType
        ? 'configurationPanel'
        : undefined;
    },
    openRoutingPanel() {
      state.modalPanelType = !state.modalPanelType ? 'routingPanel' : undefined;
    },
    closeModal() {
      state.modalPanelType = undefined;
    },
    commitUiSetting(settings: {
      showLayersDynamic?: boolean;
      showLayerDefaultAssign?: boolean;
      showProfileAdvancedOptions?: boolean;
      showTestInputArea?: boolean;
    }): void {
      copyObjectPropsPartial(state, settings);
    },
    stopLiveMode() {
      state.showLayersDynamic = false;
    },
    toggleShowTestInputArea() {
      state.showTestInputArea = !state.showTestInputArea;
    },
  };

  return {
    readers,
    actions,
  };
}
export const profileEditorStore = createProfileEditorStore();
