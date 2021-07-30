import { css, FC, jsx } from 'qx';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { ProjectKeyboardListCard } from '~/ui/components/organisms/ProjectKeyboardList.Card';

type Props = {
  projectItems: IProjectKeyboardListProjectItem[];
  currentProjectId: string;
  setCurrentProjectId: (id: string) => void;
};

export const ProjectKeyboardList: FC<Props> = ({
  projectItems,
  currentProjectId,
  setCurrentProjectId,
}) => {
  return (
    <div css={style}>
      {projectItems.map((item) => (
        <ProjectKeyboardListCard
          key={item.projectId}
          project={item}
          isCurrent={item.projectId === currentProjectId}
          setCurrent={() => setCurrentProjectId(item.projectId)}
        />
      ))}
    </div>
  );
};

const style = css`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background: #ccc;
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
`;
