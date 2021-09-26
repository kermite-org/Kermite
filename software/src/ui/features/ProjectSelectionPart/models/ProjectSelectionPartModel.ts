import { useEffect } from 'qx';
import {
  IGeneralMenuItem,
  IProjectKeyboardListProjectItem,
  ISelectorSource,
  makePlainSelectorOption,
} from '~/ui/base';
import { createProjectManagementMenuItems } from '~/ui/features/ProjectSelectionPart/models/ProjectManagementMenuModel';
import { uiReaders, projectSelectionStore } from '~/ui/store';

type IProjectSelectionPageModel = {
  sourceProjectItems: IProjectKeyboardListProjectItem[];
  projectKey: string;
  setProjectKey(projectKey: string): void;
  canSelectResourceOrigin: boolean;
  resourceOriginSelectorSource: ISelectorSource;
  isMenuButtonVisible: boolean;
  menuItems: IGeneralMenuItem[];
};

export function useProjectSelectionPartModel(): IProjectSelectionPageModel {
  const {
    readers: { canSelectResourceOrigin, tabResourceOrigin, sourceProjectItems },
    actions: { setTabResourceOrigin, setProjectKey, resetState },
  } = projectSelectionStore;

  useEffect(resetState, []);

  const resourceOriginSelectorSource: ISelectorSource = {
    options: ['local', 'online'].map(makePlainSelectorOption),
    value: tabResourceOrigin,
    setValue: setTabResourceOrigin,
  };

  return {
    sourceProjectItems,
    projectKey: uiReaders.globalProjectKey,
    setProjectKey,
    canSelectResourceOrigin,
    resourceOriginSelectorSource,
    isMenuButtonVisible: tabResourceOrigin === 'local',
    menuItems: createProjectManagementMenuItems(),
  };
}
