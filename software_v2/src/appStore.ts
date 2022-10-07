type IModelType = "onlineProjectImporter";

function createBlankProject(): ILocalProject {
  return {
    projectName: "unnamed project",
    profiles: [],
    layouts: [],
    firmwares: [],
  };
}

function createInitialProjectDummy(): ILocalProject {
  return {
    projectName: "initial dummy project",
    profiles: [
      { name: "profile1", data: {} },
      { name: "profile2", data: {} },
    ],
    layouts: [{ name: "layout1", data: {} }],
    firmwares: [{ name: "firmware1", data: {} }],
  };
}

function createAppStore() {
  const state = {
    modalType: undefined as IModelType | undefined,
    currentProject: createInitialProjectDummy(),
  };
  const actions = {
    openModel(modalType: IModelType) {
      state.modalType = modalType;
    },
    closeModal() {
      state.modalType = undefined;
    },
    loadProject(project: ILocalProject) {
      state.currentProject = project;
    },
    loadBlankProject() {
      state.currentProject = createBlankProject();
    },
  };
  return {
    state,
    actions,
  };
}

export const appStore = createAppStore();
