import { css, FC, jsx } from 'qx';
import {
  createFallbackPersistKeyboardDesign,
  IDisplayKeyboardDesign,
} from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import { ipcAgent, IProjectKeyboardListProjectItem, uiTheme } from '~/ui/base';
import { fetchAllProjectResourceInfos } from '~/ui/commonModels';
import { globalSettingsModel } from '~/ui/commonModels/GlobalSettingsModel';
import { RadioButtonLine } from '~/ui/components/molecules/RadioButtonLine';
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
  const { globalSettings } = globalSettingsModel;
  const { useLocalResouces } = globalSettings;
  const targetOrigin = useLocalResouces ? 'local' : 'online';
  const projectInfos = allProjectInfos.filter(
    (info) => info.origin === targetOrigin && info.layoutNames.length > 0,
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
      Keyboard Product Selection
      <div className="content-part">
        <ProjectKeyboardList
          className="keyboard-list"
          projectItems={sourceProjectItems}
          currentProjectId={projectId}
          setCurrentProjectId={setProjectId}
        />
        <div className="bottom-row">
          <RadioButtonLine
            checked={projectId === ''}
            onClick={() => setProjectId('')}
            text="各画面で選択する"
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
