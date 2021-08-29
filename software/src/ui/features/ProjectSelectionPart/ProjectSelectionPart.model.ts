import { useMemo, useState } from 'qx';
import {
  DisplayKeyboardDesignLoader,
  getProjectOriginAndIdFromSig,
  IResourceOrigin,
} from '~/shared';
import {
  IProjectKeyboardListProjectItem,
  ISelectorSource,
  makePlainSelectorOption,
} from '~/ui/base';
import { uiReaders } from '~/ui/commonActions';
import { globalSettingsWriter } from '~/ui/commonStore';

type IProjectSelectionPageModel = {
  sourceProjectItems: IProjectKeyboardListProjectItem[];
  projectKey: string;
  setProjectKey(projectKey: string): void;
  canSelectResourceOrigin: boolean;
  resourceOriginSelectorSource: ISelectorSource;
};

function createSourceProjectItems(
  resourceOrigin: IResourceOrigin,
): IProjectKeyboardListProjectItem[] {
  return uiReaders.allProjectPackageInfos
    .filter((info) => info.origin === resourceOrigin)
    .map((info) => ({
      projectId: info.projectId,
      projectKey: info.sig,
      keyboardName: info.keyboardName,
      design: DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
        info.layouts[0].data,
      ),
    }));
}

export function useProjectSelectionPartModel(): IProjectSelectionPageModel {
  const { isDeveloperMode } = uiReaders;
  const [resourceOrigin, setResourceOrigin] = useState(
    isDeveloperMode ? uiReaders.globalProjectOrigin || 'online' : 'online',
  );
  const sourceProjectItems = useMemo(
    () => createSourceProjectItems(resourceOrigin),
    [resourceOrigin],
  );

  const setProjectKey = (projectKey: string) => {
    const obj =
      (projectKey && getProjectOriginAndIdFromSig(projectKey)) || undefined;
    globalSettingsWriter.writeValue('globalProjectSpec', obj);
  };

  const resourceOriginSelectorSource: ISelectorSource = {
    options: ['local', 'online'].map(makePlainSelectorOption),
    value: resourceOrigin,
    setValue: (text: string) => setResourceOrigin(text as IResourceOrigin),
  };

  return {
    sourceProjectItems,
    projectKey: uiReaders.globalProjectKey,
    setProjectKey,
    canSelectResourceOrigin: isDeveloperMode,
    resourceOriginSelectorSource,
  };
}
