import { IProjectPackage } from "./base";

type IModelType = "onlineProjectImporter";

function createBlankProject(): IProjectPackage {
  return {
    formatRevision: "PKG1",
    projectId: "AAAA",
    projectName: "unnamed project",
    variationName: "",
    profiles: [],
    layouts: [],
    firmwares: [],
  };
}

function createInitialProjectDummy(): IProjectPackage {
  return {
    projectName: "initial dummy project",
    variationName: "",
    formatRevision: "PKG1",
    projectId: "AAAA",
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
    loadProject(project: IProjectPackage) {
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
