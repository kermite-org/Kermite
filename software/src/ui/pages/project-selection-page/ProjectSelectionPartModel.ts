import { useMemo } from 'qx';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { globalSettingsModel, uiStateReader } from '~/ui/commonModels';

type IProjectSelectionPageModel = {
  sourceProjectItems: IProjectKeyboardListProjectItem[];
  projectId: string;
  setProjectId: (id: string) => void;
};

function createSourceProjectItems(): IProjectKeyboardListProjectItem[] {
  const { useLocalResouces } = globalSettingsModel.globalSettings;
  const origin = useLocalResouces ? 'local' : 'online';
  return uiStateReader.allProjectPackageInfos
    .filter((info) => info.origin === origin)
    .map((info) => ({
      projectId: info.projectId,
      keyboardName: info.keyboardName,
      design: DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
        info.layouts[0].data,
      ),
    }));
}

export function useProjectSelectionPartModel(): IProjectSelectionPageModel {
  const sourceProjectItems = useMemo(createSourceProjectItems, []);
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
