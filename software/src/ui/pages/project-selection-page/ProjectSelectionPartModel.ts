import { useMemo } from 'qx';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import {
  globalSettingsReader,
  globalSettingsWriter,
  uiStateReader,
} from '~/ui/commonStore';

type IProjectSelectionPageModel = {
  sourceProjectItems: IProjectKeyboardListProjectItem[];
  projectId: string;
  setProjectId: (id: string) => void;
};

function createSourceProjectItems(): IProjectKeyboardListProjectItem[] {
  const { useLocalResouces } = globalSettingsReader.globalSettings;
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
  const { globalProjectId: projectId } = globalSettingsReader.globalSettings;
  const setProjectId = (id: string) => {
    globalSettingsWriter.writeValue('globalProjectId', id);
  };
  return {
    sourceProjectItems,
    projectId,
    setProjectId,
  };
}
