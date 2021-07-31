import { css, FC, jsx } from 'qx';
import {
  createFallbackPersistKeyboardDesign,
  IDisplayKeyboardDesign,
} from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import { ipcAgent, IProjectKeyboardListProjectItem, uiTheme } from '~/ui/base';
import {
  fetchAllProjectResourceInfos,
  fetchGlobalSettings,
} from '~/ui/commonModels';
import { globalSettingsModel } from '~/ui/commonModels/GlobalSettingsModel';
import { CheckBoxLine } from '~/ui/components';
import { ProjectKeyboardList } from '~/ui/components/organisms/ProjectKeyboardList';
import { useFetcher } from '~/ui/helpers';

type ProjectInfoEx = {
  projectId: string;
  keyboardName: string;
  projectPath: string;
  design: IDisplayKeyboardDesign;
};

async function loadSourceProjectItems(): Promise<
  IProjectKeyboardListProjectItem[]
> {
  const allProjectInfos = await fetchAllProjectResourceInfos();
  const globalSettings = await fetchGlobalSettings();
  const { useLocalResouces } = globalSettings;
  const targetOrigin = useLocalResouces ? 'local' : 'online';
  const projectInfos = allProjectInfos.filter(
    (info) => info.origin === targetOrigin,
  );
  return await Promise.all(
    projectInfos.map(async (info) => {
      const design =
        (await ipcAgent.async.projects_loadKeyboardShape(
          info.origin,
          info.projectId,
          info.layoutNames[0],
        )) || createFallbackPersistKeyboardDesign();
      const infoEx: ProjectInfoEx = {
        projectId: info.projectId,
        keyboardName: info.keyboardName,
        projectPath: info.projectPath,
        design: DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(design),
      };
      return infoEx;
    }),
  );
}

export const ProjectSelectionPage: FC = () => {
  const sourceProjectItems = useFetcher(loadSourceProjectItems, []);

  const { globalProjectId: projectId } = globalSettingsModel.globalSettings;
  const setProjectId = (id: string) => {
    globalSettingsModel.writeValue('globalProjectId', id);
  };

  return (
    <div css={style}>
      Global Project Selection
      <div className="content-part">
        <ProjectKeyboardList
          className="keyboard-list"
          projectItems={sourceProjectItems}
          currentProjectId={projectId}
          setCurrentProjectId={setProjectId}
        />
        <div className="bottom-row">
          <CheckBoxLine
            text="any"
            checked={projectId === ''}
            setChecked={(value) => value && setProjectId('')}
          />
        </div>
      </div>
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 20px;

  > .content-part {
    margin-top: 10px;

    > .keyboard-list {
      max-height: 600px;
    }

    > .bottom-row {
      margin-top: 10px;
    }
  }
`;
