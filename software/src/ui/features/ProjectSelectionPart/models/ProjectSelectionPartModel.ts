import { useState } from 'qx';
import {
  createFallbackPersistKeyboardDesign,
  DisplayKeyboardDesignLoader,
  getProjectOriginAndIdFromSig,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { featureFlags } from '~/shared/defs/FeatureFlags';
import {
  IProjectKeyboardListProjectItem,
  ISelectorSource,
  makePlainSelectorOption,
} from '~/ui/base';
import { uiReaders } from '~/ui/commonActions';
import { globalSettingsWriter } from '~/ui/commonStore';
import { useMemoEx } from '~/ui/helpers';

type IProjectSelectionPageModel = {
  sourceProjectItems: IProjectKeyboardListProjectItem[];
  projectKey: string;
  setProjectKey(projectKey: string): void;
  canSelectResourceOrigin: boolean;
  resourceOriginSelectorSource: ISelectorSource;
  isMenuButtonVisible: boolean;
};

function createSourceProjectItems(
  allProjectPackageInfos: IProjectPackageInfo[],
  resourceOrigin: IResourceOrigin,
): IProjectKeyboardListProjectItem[] {
  return allProjectPackageInfos
    .filter((info) => info.origin === resourceOrigin)
    .map((info) => ({
      projectId: info.projectId,
      projectKey: info.sig,
      keyboardName: info.keyboardName,
      design: DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
        info.layouts[0]?.data || createFallbackPersistKeyboardDesign(),
      ),
    }));
}

export function useProjectSelectionPartModel(): IProjectSelectionPageModel {
  const { isDeveloperMode } = uiReaders;
  const canSelectResourceOrigin =
    featureFlags.allowEditLocalProject && isDeveloperMode;

  const [resourceOrigin, setResourceOrigin] = useState(
    canSelectResourceOrigin
      ? uiReaders.globalProjectOrigin || 'online'
      : 'online',
  );

  const sourceProjectItems = useMemoEx(createSourceProjectItems, [
    uiReaders.allProjectPackageInfos,
    resourceOrigin,
  ]);

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
    canSelectResourceOrigin,
    resourceOriginSelectorSource,
    isMenuButtonVisible: resourceOrigin === 'local',
  };
}
