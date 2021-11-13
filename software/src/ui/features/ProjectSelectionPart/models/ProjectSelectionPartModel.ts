import { useEffect } from 'alumina';
import {
  IGeneralMenuItem,
  IProjectKeyboardListProjectItem,
  ISelectorSource,
  makePlainSelectorOption,
} from '~/ui/base';
import { createProjectManagementMenuItems } from '~/ui/features/ProjectSelectionPart/models/ProjectManagementMenuModel';
import { projectSelectionStore } from '~/ui/features/ProjectSelectionPart/store';
import { uiReaders } from '~/ui/store';

type IProjectSelectionPageModel = {
  sourceProjectItems: IProjectKeyboardListProjectItem[];
  projectKey: string;
  setProjectKey(projectKey: string): void;
  canSelectResourceOrigin: boolean;
  resourceOriginSelectorSource: ISelectorSource;
  isMenuButtonVisible: boolean;
  menuItems: IGeneralMenuItem[];
  showNoSelectionOption: boolean;
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
    showNoSelectionOption: true,
  };
}
