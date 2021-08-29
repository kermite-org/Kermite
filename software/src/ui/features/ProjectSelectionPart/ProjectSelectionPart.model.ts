import { useMemo, useState } from 'qx';
import { DisplayKeyboardDesignLoader, IResourceOrigin } from '~/shared';
import {
  IProjectKeyboardListProjectItem,
  ISelectorSource,
  makePlainSelectorOption,
} from '~/ui/base';
import { uiReaders } from '~/ui/commonActions';
import { globalSettingsReader, globalSettingsWriter } from '~/ui/commonStore';

type IProjectSelectionPageModel = {
  sourceProjectItems: IProjectKeyboardListProjectItem[];
  projectId: string;
  setProjectId(id: string): void;
  resourceOriginSelectorSource: ISelectorSource;
};

function createSourceProjectItems(
  resourceOrigin: IResourceOrigin,
): IProjectKeyboardListProjectItem[] {
  return uiReaders.allProjectPackageInfos
    .filter((info) => info.origin === resourceOrigin)
    .map((info) => ({
      projectId: info.projectId,
      keyboardName: info.keyboardName,
      design: DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
        info.layouts[0].data,
      ),
    }));
}

export function useProjectSelectionPartModel(): IProjectSelectionPageModel {
  const [resourceOrigin, setResourceOrigin] = useState(
    globalSettingsReader.settingsResourceOrigin,
  );
  const sourceProjectItems = useMemo(
    () => createSourceProjectItems(resourceOrigin),
    [resourceOrigin],
  );

  const setProjectId = (projectId: string) => {
    globalSettingsWriter.writeValue('globalProjectId', projectId);
    globalSettingsWriter.writeValue(
      'useLocalResources',
      resourceOrigin === 'local',
    );
  };

  const resourceOriginSelectorSource: ISelectorSource = {
    options: ['local', 'online'].map(makePlainSelectorOption),
    value: resourceOrigin,
    setValue: (text: string) => setResourceOrigin(text as IResourceOrigin),
  };

  return {
    sourceProjectItems,
    projectId: uiReaders.globalProjectId,
    setProjectId,
    resourceOriginSelectorSource,
  };
}
