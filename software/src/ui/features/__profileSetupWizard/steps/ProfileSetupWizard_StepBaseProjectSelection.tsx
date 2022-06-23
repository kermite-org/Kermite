import { css, FC, jsx } from 'alumina';
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
import { ProjectKeyboardList } from '~/ui/fabrics';
import { ProjectKeyboardListProjectAddCard } from '~/ui/fabrics/ProjectKeyboardList/ProjectKeyboardList.ProjectAddCard';
import { profileSetupStore } from '~/ui/features/ProfileSetupWizard/store/ProfileSetupStore';
import { uiReaders } from '~/ui/store';
import { useMemoEx } from '~/ui/utils';

const helpers = {
  createSourceProjectItems(
    allProjectPackageInfos: IProjectPackageInfo[],
    isDeveloperMode: boolean,
    showDevelopmentPackages: boolean,
  ): IProjectKeyboardListProjectItem[] {
    let onlineProjects = allProjectPackageInfos
      .filter((info) => info.origin === 'online')
      .sort(sortOrderBy((it) => it.keyboardName));
    const localProjects = allProjectPackageInfos
      .filter((info) => info.origin === 'local' && !info.isDraft)
      .sort(sortOrderBy((it) => it.keyboardName));

    if (!(isDeveloperMode && showDevelopmentPackages)) {
      onlineProjects = onlineProjects.filter(
        (it) => !it.onlineProjectAttributes?.isDevelopment,
      );
    }

    return [...onlineProjects, ...localProjects].map((info) => ({
      projectId: info.projectId,
      projectKey: info.projectKey,
      keyboardName: `${getProjectDisplayNamePrefix(info.origin, false)}${
        info.keyboardName
      }`,
      design: DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
        info.layouts[0]?.data || createFallbackPersistKeyboardDesign(),
      ),
      onlineProjectAttrs: info.onlineProjectAttributes,
    }));
  },
};

export const ProfileSetupWizard_StepBaseProfileSelection: FC = () => {
  const { targetProjectKey } = profileSetupStore.state;
  const {
    setTargetProjectKey,
    handleSelectLocalPackageToImport,
    handleLocalPackageFileDrop,
  } = profileSetupStore.actions;
  const sourceProjectItems = useMemoEx(helpers.createSourceProjectItems, [
    uiReaders.allProjectPackageInfos,
    uiReaders.isDeveloperMode,
    uiReaders.globalSettings.showDevelopmentPackages,
  ]);

  return (
    <div class={style}>
      <ProjectKeyboardList
        projectItems={sourceProjectItems}
        currentProjectKey={targetProjectKey}
        setCurrentProjectKey={setTargetProjectKey}
        renderAdditionalItem={() => (
          <ProjectKeyboardListProjectAddCard
            onClick={handleSelectLocalPackageToImport}
            onFileDrop={handleLocalPackageFileDrop}
          />
        )}
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
