import { css, FC, jsx } from 'qx';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { RadioButtonLine } from '~/ui/components/molecules/RadioButtonLine';
import { ProjectKeyboardList } from '~/ui/components/organisms/ProjectKeyboardList';

type Props = {
  sourceProjectItems: IProjectKeyboardListProjectItem[];
  projectId: string;
  setProjectId: (id: string) => void;
};

export const ProjectSelectionPartView: FC<Props> = ({
  sourceProjectItems,
  projectId,
  setProjectId,
}) => {
  return (
    <div css={style}>
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
    max-height: 600px;
  }

  > .bottom-row {
    margin-top: 10px;
  }
`;
