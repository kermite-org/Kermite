import { useEffect } from 'qx';
import {
  compareObjectByJsonStringify,
  createFallbackPersistKeyboardDesign,
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
  loadedDesign: IPersistKeyboardDesign;
  isModified: boolean;
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

let _prevLoadedDesign: IPersistKeyboardDesign | undefined;
let _keepUnsavedNewDesign: boolean = false;

const local = new (class {
  loadedLayoutData: IPersistKeyboardDesign = createFallbackPersistKeyboardDesign();
})();

export const layoutManagerReader = {
  get editSource(): ILayoutEditSource {
    return uiState.core.layoutEditSource;
  },
  get loadedDesign() {
    return local.loadedLayoutData;
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
    _keepUnsavedNewDesign = false;
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
  async showEditLayoutFileInFiler() {
    await ipcAgent.async.layout_showEditLayoutFileInFiler();
  },
};

function updateBeforeRender() {
  const sourceLayoutData = uiState.core.loadedLayoutData;

  useEffect(() => {
    const same = compareObjectByJsonStringify(
      sourceLayoutData,
      _prevLoadedDesign,
    );
    const isClean = compareObjectByJsonStringify(
      sourceLayoutData,
      createFallbackPersistKeyboardDesign(),
    );
    if (isClean && _keepUnsavedNewDesign) {
      return;
    }
    if (!same || isClean) {
      UiLayouterCore.loadEditDesign(sourceLayoutData);
      _prevLoadedDesign = sourceLayoutData;
    }
  }, [sourceLayoutData]);

  // useEffect(() => {
  //   if (uiState.core.loadedProfileData) {
  //     if (this.editSource.type === 'CurrentProfile') {
  //       this.sendCommand({ type: 'loadCurrentProfileLayout' });
  //     }
  //   }
  // }, [uiState.core]);

  useEffect(() => {
    return () => {
      const { isModified, editSource } = layoutManagerReader;
      if (isModified) {
        if (editSource.type === 'CurrentProfile') {
          const design = UiLayouterCore.emitSavingDesign();
          editorModel.replaceKeyboardDesign(design);
        }
        if (editSource.type === 'LayoutNewlyCreated') {
          _keepUnsavedNewDesign = true;
        }
      }
    };
  }, []);
}

export function useLayoutManagerModel(): ILayoutManagerModel {
  const { editSource, loadedDesign, isModified } = layoutManagerReader;
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

  updateBeforeRender();

  return {
    editSource,
    loadedDesign,
    isModified,
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
