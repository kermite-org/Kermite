import {
  compareObjectByJsonStringify,
  fileExtensions,
  IPersistKeyboardDesign,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { modalConfirm } from '~/ui/components';
import { assignerModel, LayoutEditorCore } from '~/ui/featureEditors';
import {
  ILayoutManagerEditTarget,
  ILayoutManagerModalState,
  layoutManagerState,
} from '~/ui/pages/layoutEditorPage/models/layoutManagerBase';
import { layoutManagerReader } from '~/ui/pages/layoutEditorPage/models/layoutManagerReaders';
import {
  dispatchCoreAction,
  projectPackagesReader,
  uiActions,
  uiReaders,
  uiState,
} from '~/ui/store';

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
  openCopyFromProjectModal: () => setModalState('CopyFromProject'),
  openKicadImporterModal: () => setModalState('LoadKicadPcbShape'),
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
      assignerModel.restoreOriginalDesign();
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
    const fileHandle = await ipcAgent.async.file_getOpenJsonFilePathWithDialog(
      fileExtensions.layout,
    );
    if (fileHandle) {
      await dispatchCoreAction({ layout_loadFromFile: { fileHandle } });
    }
  },

  async saveToFileWithDialog() {
    const design = LayoutEditorCore.emitSavingDesign();
    const namePart = layoutManagerReader.getSavingFileDefaultNamePart();
    const extension = fileExtensions.layout;
    const fileHandle = await ipcAgent.async.file_getSaveJsonFilePathWithDialog(
      extension,
      `${namePart}${extension}`,
    );
    if (fileHandle) {
      await dispatchCoreAction({
        layout_saveToFile: { fileHandle, design },
      });
      if (fileHandle.isPreSelectedFile) {
        await modalConfirm({ caption: 'save to file', message: 'file saved.' });
      }
    }
  },
  async exportToFileWithDialog() {
    const design = LayoutEditorCore.emitSavingDesign();
    const namePart = layoutManagerReader.getSavingFileDefaultNamePart();
    const extension = fileExtensions.layout;
    const fileHandle = await ipcAgent.async.file_getSaveJsonFilePathWithDialog(
      extension,
      `${namePart}${extension}`,
    );
    if (fileHandle) {
      await dispatchCoreAction({
        layout_exportToFile: { fileHandle, design },
      });
      if (fileHandle.isPreSelectedFile) {
        await modalConfirm({
          caption: 'export to file',
          message: 'file saved.',
        });
      }
    }
  },
  save(design: IPersistKeyboardDesign) {
    dispatchCoreAction({ layout_overwriteCurrentLayout: { design } });
    LayoutEditorCore.rebase();
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
    const layout = LayoutEditorCore.emitSavingDesign();
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
    layoutManagerActions.save(LayoutEditorCore.emitSavingDesign());
  },
  showEditLayoutFileInFiler() {
    dispatchCoreAction({ layout_showEditLayoutFileInFiler: 1 });
  },
};
