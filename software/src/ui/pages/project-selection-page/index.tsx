import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { useProjectSelectionPartModel } from '~/ui/pages/project-selection-page/ProjectSelectionPartModel';
import { ProjectSelectionPartView } from '~/ui/pages/project-selection-page/ProjectSelectionPartView';

export const ProjectSelectionPage: FC = () => {
  const {
    sourceProjectItems,
    projectId,
    setProjectId,
  } = useProjectSelectionPartModel();
  return (
    <div css={style}>
      Keyboard Product Selection
      <ProjectSelectionPartView
        sourceProjectItems={sourceProjectItems}
        projectId={projectId}
        setProjectId={setProjectId}
      />
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 20px;
`;
