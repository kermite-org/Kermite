import {
  compareObjectByJsonStringify,
  forceChangeFilePathExtension,
  IPersistKeyboardDesign,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import {
  dispatchCoreAction,
  projectPackagesReader,
  uiActions,
  uiReaders,
  uiState,
} from '~/ui/commonStore';
import { modalConfirm } from '~/ui/components';
import { UiLayouterCore } from '~/ui/features';
import { editorModel } from '~/ui/features/ProfileEditor/models/EditorModel';
import {
  ILayoutManagerEditTarget,
  ILayoutManagerModalState,
  layoutManagerState,
} from '~/ui/pages/layouter-page/models/LayoutManagerBase';
import { layoutManagerReader } from '~/ui/pages/layouter-page/models/LayoutManagerReaders';

function setModalState(state: ILayoutManagerModalState) {
  layoutManagerState.modalState = state;
}

async function checkShallLoadData(): Promise<boolean> {
  if (!layoutManagerReader.isModified) {
    return true;
  }
  return await modalConfirm({
    message: 'Unsaved changes will be lost. Are you OK?',
    caption: 'Load',
  });
}

async function checkShallLoadDataForProfile(): Promise<boolean> {
  const profileModified = !compareObjectByJsonStringify(
    uiState.core.loadedProfileData,
    uiState.core.editProfileData,
  );
  if (!profileModified) {
    return true;
  }
  return await modalConfirm({
    message: 'Unsaved changes of current profile will be lost. Are you OK?',
    caption: 'create new profile',
  });
}

export const layoutManagerActions = {
  setEditTargetRadioSelection(value: ILayoutManagerEditTarget) {
    const { editTargetRadioSelection } = layoutManagerReader;
    if (editTargetRadioSelection !== value) {
      if (value === 'CurrentProfile') {
        layoutManagerActions.loadCurrentProfileLayout();
      } else {
        layoutManagerActions.createNewLayout();
      }
    }
  },
  openLoadFromProjectModal: () => setModalState('LoadFromProject'),
  openSaveToProjectModal: () => setModalState('SaveToProject'),
  closeModal: () => setModalState('None'),
  async createNewLayout() {
    if (!(await checkShallLoadData())) {
      return;
    }
    if (
      layoutManagerReader.editSource.type === 'CurrentProfile' &&
      layoutManagerReader.isModified
    ) {
      editorModel.restoreOriginalDesign();
    }
    dispatchCoreAction({ layout_createNewLayout: 1 });
  },

  async loadCurrentProfileLayout() {
    if (!(await checkShallLoadData())) {
      return;
    }
    dispatchCoreAction({ layout_loadCurrentProfileLayout: 1 });
  },

  async createForProject(projectId: string, layoutName: string) {
    if (!(await checkShallLoadData())) {
      return;
    }
    dispatchCoreAction({
      layout_createProjectLayout: { projectId, layoutName },
    });
  },

  async loadFromProject(projectId: string, layoutName: string) {
    if (!(await checkShallLoadData())) {
      return;
    }
    dispatchCoreAction({ layout_loadProjectLayout: { projectId, layoutName } });
  },

  async saveToProject(
    projectId: string,
    layoutName: string,
    design: IPersistKeyboardDesign,
  ) {
    const isExist = !!projectPackagesReader
      .getEditTargetProject()
      ?.layouts.some((it) => it.layoutName === layoutName);
    if (isExist) {
      const ok = await modalConfirm({
        message: 'File overwritten. Are you sure?',
        caption: 'Save',
      });
      if (!ok) {
        return;
      }
    }
    dispatchCoreAction({
      layout_saveProjectLayout: { projectId, layoutName, design },
    });
  },

  async loadFromFileWithDialog() {
    if (!(await checkShallLoadData())) {
      return;
    }
    const filePath = await ipcAgent.async.file_getOpenJsonFilePathWithDialog();
    if (filePath) {
      dispatchCoreAction({ layout_loadFromFile: { filePath } });
    }
  },

  async saveToFileWithDialog() {
    const design = UiLayouterCore.emitSavingDesign();
    const filePath = await ipcAgent.async.file_getSaveJsonFilePathWithDialog();
    if (filePath) {
      const modFilePath = forceChangeFilePathExtension(
        filePath,
        '.layout.json',
      );
      dispatchCoreAction({
        layout_saveToFile: { filePath: modFilePath, design },
      });
    }
  },

  save(design: IPersistKeyboardDesign) {
    const { editSource } = layoutManagerReader;
    const isProfile = editSource.type === 'CurrentProfile';
    if (isProfile) {
      throw new Error('invalid handler invocation');
    }
    // const ok = await modalConfirm({
    //   message: `File overwritten. Are you ok?`,
    //   caption: 'Save',
    // });
    dispatchCoreAction({ layout_overwriteCurrentLayout: { design } });
    UiLayouterCore.rebase();
  },

  async createNewProfileFromCurrentLayout() {
    if (!(await checkShallLoadDataForProfile())) {
      return;
    }
    const { globalProjectId } = uiReaders;
    let projectId = '000000';
    if (globalProjectId) {
      projectId = globalProjectId;
    } else {
      const { editSource } = layoutManagerReader;
      if (editSource.type === 'ProjectLayout') {
        projectId = editSource.projectId;
      } else if (editSource.type === 'CurrentProfile') {
        const profile = await ipcAgent.async.profile_getCurrentProfile();
        if (!profile) {
          console.error('current profile unavailable');
          return;
        }
        projectId = profile.projectId;
      }
    }
    const layout = UiLayouterCore.emitSavingDesign();
    dispatchCoreAction({
      profile_createProfileFromLayout: {
        projectId,
        layout,
      },
    });
    uiActions.navigateTo('/assigner');
    dispatchCoreAction({ layout_loadCurrentProfileLayout: 1 });
  },
  overwriteLayout() {
    layoutManagerActions.save(UiLayouterCore.emitSavingDesign());
  },
  showEditLayoutFileInFiler() {
    dispatchCoreAction({ layout_showEditLayoutFileInFiler: 1 });
  },
};
