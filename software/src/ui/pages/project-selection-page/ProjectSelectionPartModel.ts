import { useMemo } from 'qx';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { globalSettingsModel } from '~/ui/commonModels/GlobalSettingsModel';
import { uiGlobalStore } from '~/ui/commonModels/UiGlobalStore';

type IProjectSelectionPageModel = {
  sourceProjectItems: IProjectKeyboardListProjectItem[];
  projectId: string;
  setProjectId: (id: string) => void;
};

function createSourceProjectItems(): IProjectKeyboardListProjectItem[] {
  return uiGlobalStore.allProjectPackageInfos.map((info) => ({
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
