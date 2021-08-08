import {
  createFallbackPersistKeyboardDesign,
  IDisplayKeyboardDesign,
} from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import { ipcAgent, IProjectKeyboardListProjectItem } from '~/ui/base';
import {
  fetchAllProjectResourceInfos,
  readSettingsResouceOrigin,
} from '~/ui/commonModels';
import { globalSettingsModel } from '~/ui/commonModels/GlobalSettingsModel';
import { useFetcher } from '~/ui/helpers';

type IProjectSelectionPageModel = {
  sourceProjectItems: IProjectKeyboardListProjectItem[];
  projectId: string;
  setProjectId: (id: string) => void;
};

type ProjectInfoEx = {
  projectId: string;
  keyboardName: string;
  projectPath: string;
  design: IDisplayKeyboardDesign;
};

async function loadSourceProjectItems(): Promise<
  IProjectKeyboardListProjectItem[]
> {
  const allProjectInfos = await fetchAllProjectResourceInfos();
  const targetOrigin = readSettingsResouceOrigin(
    globalSettingsModel.globalSettings,
  );
  const projectInfos = allProjectInfos.filter(
    (info) => info.origin === targetOrigin && info.layoutNames.length > 0,
  );
  return await Promise.all(
    projectInfos.map(async (info) => {
      const design =
        (await ipcAgent.async.projects_loadKeyboardShape(
          info.origin,
          info.projectId,
          info.layoutNames[0],
        )) || createFallbackPersistKeyboardDesign();
      const infoEx: ProjectInfoEx = {
        projectId: info.projectId,
        keyboardName: info.keyboardName,
        projectPath: info.projectPath,
        design: DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design),
      };
      return infoEx;
    }),
  );
}

export function useProjectSelectionPartModel(): IProjectSelectionPageModel {
  const sourceProjectItems = useFetcher(loadSourceProjectItems, []);
  const { globalProjectId: projectId } = globalSettingsModel.globalSettings;
  const setProjectId = (id: string) => {
    globalSettingsModel.writeValue('globalProjectId', id);
  };
  return {
    sourceProjectItems,
    projectId,
    setProjectId,
  };
}
