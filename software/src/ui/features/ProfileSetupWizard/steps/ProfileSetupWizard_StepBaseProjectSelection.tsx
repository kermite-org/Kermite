import { css, FC, jsx, useMemo } from 'alumina';
import {
  createFallbackPersistKeyboardDesign,
  DisplayKeyboardDesignLoader,
  IProjectPackageInfo,
  sortOrderBy,
} from '~/shared';
import {
  colors,
  getProjectDisplayNamePrefix,
  IProjectKeyboardListProjectItem,
} from '~/ui/base';
import { ProjectSelectionPartComponent } from '~/ui/fabrics';
import { profileSetupStore } from '~/ui/features/ProfileSetupWizard/store/ProfileSetupStore';
import { uiReaders } from '~/ui/store';

const helpers = {
  createSourceProjectItems(
    allProjectPackageInfos: IProjectPackageInfo[],
  ): IProjectKeyboardListProjectItem[] {
    const onlineProjects = allProjectPackageInfos
      .filter((info) => info.origin === 'online')
      .sort(sortOrderBy((it) => it.keyboardName));
    const localProjects = allProjectPackageInfos
      .filter((info) => info.origin === 'local' && !info.isDraft)
      .sort(sortOrderBy((it) => it.keyboardName));

    return [...onlineProjects, ...localProjects].map((info) => ({
      projectId: info.projectId,
      projectKey: info.projectKey,
      keyboardName: `${getProjectDisplayNamePrefix(info.origin, false)}${
        info.keyboardName
      }`,
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
