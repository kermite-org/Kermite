import {
  IProjectPackage,
  createFallbackPersistKeyboardLayout,
  createFallbackPersistProfileData,
} from '~/app-shared';

type IModelType = 'onlineProjectImporter';

function createBlankProject(): IProjectPackage {
  return {
    formatRevision: 'PKG1',
    projectId: 'AAAA',
    projectName: 'unnamed project',
    variationName: '',
    profiles: [],
    layouts: [],
    firmwares: [],
  };
}

function createInitialProjectDummy(): IProjectPackage {
  return {
    projectName: 'initial dummy project',
    variationName: '',
    formatRevision: 'PKG1',
    projectId: 'AAAA',
    profiles: [
      { name: 'profile1', data: createFallbackPersistProfileData() },
      { name: 'profile2', data: createFallbackPersistProfileData() },
    ],
    layouts: [{ name: 'layout1', data: createFallbackPersistKeyboardLayout() }],
    firmwares: [
      {
        name: 'firmware1',
        data: {
          type: 'standard',
          variationId: 'variation1',
          standardFirmwareConfig: {} as any,
        },
      },
    ],
  };
}

function createAppStore() {
  const state = {
    modalType: undefined as IModelType | undefined,
    editorTargetPath: undefined as string | undefined,
    currentProject: createInitialProjectDummy(),
  };

  const actions = {
    openModel(modalType: IModelType) {
      state.modalType = modalType;
    },
    closeModal() {
      state.modalType = undefined;
    },
    loadProject(project: IProjectPackage) {
      state.currentProject = project;
    },
    loadBlankProject() {
      state.currentProject = createBlankProject();
    },
    setEditorTargetPath(path: string | undefined) {
      state.editorTargetPath = path;
    },
    openProfile(profileName: string) {
      state.editorTargetPath = undefined;
    },
    openLayout(layoutName: string) {
      const { projectId } = state.currentProject;
      state.editorTargetPath = `${projectId}/layout/${layoutName}`;
    },
  };
  return {
    state,
    actions,
  };
}

export const appStore = createAppStore();
