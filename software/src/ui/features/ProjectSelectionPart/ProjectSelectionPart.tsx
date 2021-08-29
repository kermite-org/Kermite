import { css, FC, jsx } from 'qx';
import {
  RibbonSelector,
  ProjectKeyboardList,
  RadioButtonLine,
} from '~/ui/components';
import { useProjectSelectionPartModel } from './ProjectSelectionPart.model';

export const ProjectSelectionPart: FC = () => {
  const {
    sourceProjectItems,
    projectId,
    setProjectId,
    resourceOriginSelectorSource,
  } = useProjectSelectionPartModel();
  return (
    <div css={style}>
      <div className="top-row">
        <RibbonSelector {...resourceOriginSelectorSource} />
      </div>
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
  );
};

const style = css`
  margin-top: 10px;

  > .keyboard-list {
    margin-top: 10px;
    max-height: 600px;
  }

  > .bottom-row {
    margin-top: 10px;
  }
`;
