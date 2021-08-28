import { useMemo } from 'qx';
import { DisplayKeyboardDesignLoader } from '~/shared';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { uiActions, uiReaders } from '~/ui/commonActions';

type IProjectSelectionPageModel = {
  sourceProjectItems: IProjectKeyboardListProjectItem[];
  projectId: string;
  setProjectId: (id: string) => void;
};

function createSourceProjectItems(): IProjectKeyboardListProjectItem[] {
  const { useLocalResources } = uiReaders;
  const origin = useLocalResources ? 'local' : 'online';
  return uiReaders.allProjectPackageInfos
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
  const { globalProjectId: projectId } = uiReaders;
  const { setGlobalProjectId: setProjectId } = uiActions;
  return {
    sourceProjectItems,
    projectId,
    setProjectId,
  };
}
