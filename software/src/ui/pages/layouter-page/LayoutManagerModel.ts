import { useEffect } from 'qx';
import {
  forceChangeFilePathExtension,
  ILayoutEditSource,
  IPersistKeyboardDesign,
} from '~/shared';
import { ipcAgent, router } from '~/ui/base';
import {
  dispatchCoreAction,
  projectPackagesReader,
  uiState,
} from '~/ui/commonStore';
import { modalConfirm } from '~/ui/components';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';
import { UiLayouterCore } from '~/ui/pages/layouter';

export interface ILayoutManagerModel {
  editSource: ILayoutEditSource;
  isModified: boolean;
  hasLayoutEntities: boolean;
  createNewLayout(): void;
  loadCurrentProfileLayout(): void;
  createForProject(projectId: string, layoutName: string): void;
  loadFromProject(projectId: string, layoutName: string): void;
  saveToProject(
    projectId: string,
    layoutName: string,
    design: IPersistKeyboardDesign,
  ): void;
  loadFromFileWithDialog(): void;
  saveToFileWithDialog(design: IPersistKeyboardDesign): void;
  save(design: IPersistKeyboardDesign): void;
  createNewProfileFromCurrentLayout(): void;
  showEditLayoutFileInFiler(): void;
}

export const layoutManagerReader = {
  get editSource(): ILayoutEditSource {
    return uiState.core.layoutEditSource;
  },
  get isModified() {
    return UiLayouterCore.getIsModified();
  },
};

async function checkShallLoadData(): Promise<boolean> {
  if (!layoutManagerReader.isModified) {
    return true;
  }
  return await modalConfirm({
    message: 'Unsaved changes will be lost. Are you OK?',
    caption: 'Load',
  });
}

const layoutManagerActions = {
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

  async saveToFileWithDialog(design: IPersistKeyboardDesign) {
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

  async save(design: IPersistKeyboardDesign) {
    const { editSource } = layoutManagerReader;
    const isProfile = editSource.type === 'CurrentProfile';
    const ok = await modalConfirm({
      message: `${isProfile ? 'Profile' : 'File'} overwritten. Are you ok?`,
      caption: 'Save',
    });
    if (ok) {
      dispatchCoreAction({ layout_overwriteCurrentLayout: { design } });
    }
  },

  async createNewProfileFromCurrentLayout() {
    const { editSource } = layoutManagerReader;
    let projectId = '000000';
    if (editSource.type === 'ProjectLayout') {
      projectId = editSource.projectId;
    }
    if (editSource.type === 'CurrentProfile') {
      const profile = await ipcAgent.async.profile_getCurrentProfile();
      if (!profile) {
        console.error('current profile unavailable');
        return;
      }
      projectId = profile.projectId;
    }
    const layout = UiLayouterCore.emitSavingDesign();
    dispatchCoreAction({
      profile_createProfileFromLayout: {
        projectId,
        layout,
      },
    });
    router.navigateTo('/editor');
    dispatchCoreAction({ layout_loadCurrentProfileLayout: 1 });
  },
  showEditLayoutFileInFiler() {
    dispatchCoreAction({ layout_showEditLayoutFileInFiler: 1 });
  },
};

const local = new (class {
  layoutEditSource: ILayoutEditSource = { type: 'CurrentProfile' };
})();

export const layoutManagerRootModel = {
  updateBeforeRender() {
    const { layoutEditSource, loadedLayoutData } = uiState.core;

    useEffect(() => {
      if (layoutEditSource !== local.layoutEditSource) {
        UiLayouterCore.loadEditDesign(loadedLayoutData);
        local.layoutEditSource = layoutEditSource;
      }
    }, [layoutEditSource]);

    useEffect(() => {
      return () => {
        const layoutEditSourceOnClosingView = uiState.core.layoutEditSource;
        if (layoutEditSourceOnClosingView.type === 'CurrentProfile') {
          const design = UiLayouterCore.emitSavingDesign();
          editorModel.replaceKeyboardDesign(design);
        }
      };
    }, []);
  },
};

export function useLayoutManagerModel(): ILayoutManagerModel {
  const { editSource, isModified } = layoutManagerReader;
  const {
    createNewLayout,
    loadCurrentProfileLayout,
    createForProject,
    loadFromProject,
    saveToProject,
    loadFromFileWithDialog,
    saveToFileWithDialog,
    save,
    createNewProfileFromCurrentLayout,
    showEditLayoutFileInFiler,
  } = layoutManagerActions;

  layoutManagerRootModel.updateBeforeRender();

  return {
    editSource,
    isModified,
    hasLayoutEntities: UiLayouterCore.hasEditLayoutEntities(),
    createNewLayout,
    loadCurrentProfileLayout,
    createForProject,
    loadFromProject,
    saveToProject,
    loadFromFileWithDialog,
    saveToFileWithDialog,
    save,
    createNewProfileFromCurrentLayout,
    showEditLayoutFileInFiler,
  };
}
