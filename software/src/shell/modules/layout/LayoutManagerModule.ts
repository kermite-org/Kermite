import produce from 'immer';
import {
  createFallbackPersistKeyboardDesign,
  duplicateObjectByJsonStringifyParse,
} from '~/shared';
import { appEnv } from '~/shell/base';
import { LayoutFileLoader } from '~/shell/loaders/LayoutFileLoader';
import {
  commitCoreState,
  coreState,
  createCoreModule,
  dispatchCoreAction,
  profilesReader,
  projectPackagesReader,
} from '~/shell/modules/core';

const layoutManagerModuleHelper = {
  getCurrentEditLayoutFilePath(): string | undefined {
    const { layoutEditSource } = coreState;
    if (layoutEditSource.type === 'ProjectLayout') {
      const { projectId } = layoutEditSource;
      const projectInfo = projectPackagesReader.getLocalProjectInfo(projectId);
      if (projectInfo) {
        return appEnv.resolveUserDataFilePath(
          `data/projects/${projectInfo?.packageName}.kmpkg.json`,
        );
      }
    } else if (layoutEditSource.type === 'File') {
      return layoutEditSource.filePath;
    }
  },
};

export const layoutManagerModule = createCoreModule({
  layout_createNewLayout() {
    commitCoreState({
      layoutEditSource: { type: 'LayoutNewlyCreated' },
      loadedLayoutData: createFallbackPersistKeyboardDesign(),
    });
  },
  layout_loadCurrentProfileLayout() {
    const profile = profilesReader.getCurrentProfile();
    if (profile) {
      commitCoreState({
        layoutEditSource: { type: 'CurrentProfile' },
        loadedLayoutData: profile.keyboardDesign,
      });
    }
  },
  async layout_overwriteCurrentLayout({ design }) {
    const { layoutEditSource } = coreState;
    if (layoutEditSource.type === 'LayoutNewlyCreated') {
      throw new Error('cannot save newly created layout');
    } else if (layoutEditSource.type === 'CurrentProfile') {
      const profile = profilesReader.getCurrentProfile();
      if (profile) {
        const newProfile = duplicateObjectByJsonStringifyParse(profile);
        newProfile.keyboardDesign = design;
        await dispatchCoreAction({
          profile_saveCurrentProfile: { profileData: newProfile },
        });
      }
    } else if (layoutEditSource.type === 'File') {
      const { filePath } = layoutEditSource;
      await LayoutFileLoader.saveLayoutToFile(filePath, design);
    } else if (layoutEditSource.type === 'ProjectLayout') {
      const { projectId, layoutName } = layoutEditSource;
      layoutManagerModule.layout_saveProjectLayout({
        projectId,
        layoutName,
        design,
      });
    }
    commitCoreState({ loadedLayoutData: design });
  },
  async layout_loadFromFile({ filePath }) {
    const loadedDesign = await LayoutFileLoader.loadLayoutFromFile(filePath);
    commitCoreState({
      layoutEditSource: { type: 'File', filePath },
      loadedLayoutData: loadedDesign,
    });
  },
  async layout_saveToFile({ filePath, design }) {
    await LayoutFileLoader.saveLayoutToFile(filePath, design);
    commitCoreState({
      layoutEditSource: { type: 'File', filePath },
      loadedLayoutData: design,
    });
  },
  async layout_exportToFile({ filePath, design }) {
    await LayoutFileLoader.saveLayoutToFile(filePath, design);
  },
  layout_createProjectLayout({ projectId, layoutName }) {
    const projectInfo = projectPackagesReader.getLocalProjectInfo(projectId);
    if (projectInfo) {
      const design = createFallbackPersistKeyboardDesign();
      commitCoreState({
        layoutEditSource: {
          type: 'ProjectLayout',
          projectId,
          layoutName,
        },
        loadedLayoutData: design,
      });
    }
  },
  layout_loadProjectLayout({ projectId, layoutName }) {
    const projectInfo = projectPackagesReader.getLocalProjectInfo(projectId);
    if (projectInfo) {
      const layout = projectInfo.layouts.find(
        (it) => it.layoutName === layoutName,
      )?.data;
      if (layout) {
        commitCoreState({
          layoutEditSource: {
            type: 'ProjectLayout',
            projectId,
            layoutName,
          },
          loadedLayoutData: layout,
        });
      }
    }
  },
  layout_saveProjectLayout({ projectId, layoutName, design }) {
    const projectInfo = projectPackagesReader.getLocalProjectInfo(projectId);
    if (projectInfo) {
      const newProjectInfo = produce(projectInfo, (draft) => {
        const layout = draft.layouts.find((it) => it.layoutName === layoutName);
        if (layout) {
          layout.data = design;
        } else {
          draft.layouts.push({ layoutName, data: design });
        }
      });
      dispatchCoreAction({
        project_saveLocalProjectPackageInfo: newProjectInfo,
      });
    }
  },
  layout_showEditLayoutFileInFiler() {
    // const filePath = layoutManagerModuleHelper.getCurrentEditLayoutFilePath();
    // if (filePath) {
    //   shell.showItemInFolder(filePath);
    // }
    throw new Error('obsolete function invoked');
  },
});
