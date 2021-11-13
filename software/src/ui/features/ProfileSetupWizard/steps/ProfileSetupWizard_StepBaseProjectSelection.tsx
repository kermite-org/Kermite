import { css, FC, jsx, useMemo } from 'alumina';
import {
  createFallbackPersistKeyboardDesign,
  DisplayKeyboardDesignLoader,
  IProjectPackageInfo,
  sortOrderBy,
} from '~/shared';
import { colors, IProjectKeyboardListProjectItem } from '~/ui/base';
import { ProjectSelectionPartComponent } from '~/ui/fabrics';
import { profileSetupStore } from '~/ui/features/ProfileSetupWizard/store/ProfileSetupStore';
import { uiReaders } from '~/ui/store';

const helpers = {
  createSourceProjectItems(
    allProjectPackageInfos: IProjectPackageInfo[],
  ): IProjectKeyboardListProjectItem[] {
    const filteredProjects = allProjectPackageInfos.filter(
      (info) => info.origin === 'online',
    );
    filteredProjects.sort(sortOrderBy((it) => it.keyboardName));
    return filteredProjects.map((info) => ({
      projectId: info.projectId,
      projectKey: info.projectKey,
      keyboardName: info.keyboardName,
      design: DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
        info.layouts[0]?.data || createFallbackPersistKeyboardDesign(),
      ),
    }));
  },
};

export const ProfileSetupWizard_StepBaseProfileSelection: FC = () => {
  const { targetProjectKey } = profileSetupStore.state;
  const { setTargetProjectKey } = profileSetupStore.actions;
  const sourceProjectItems = useMemo(
    () => helpers.createSourceProjectItems(uiReaders.allProjectPackageInfos),
    [],
  );

  return (
    <div class={style}>
      <ProjectSelectionPartComponent
        sourceProjectItems={sourceProjectItems}
        projectKey={targetProjectKey}
        setProjectKey={setTargetProjectKey}
      />
    </div>
  );
};

const style = css`
  height: 100%;
  background-color: ${colors.clPanelBox};
  padding: 20px;
  overflow-y: auto;
`;
