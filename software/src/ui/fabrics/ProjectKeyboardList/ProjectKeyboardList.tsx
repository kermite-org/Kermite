import { css, FC, jsx } from 'qx';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { ProjectKeyboardListCard } from '~/ui/fabrics/ProjectKeyboardList/ProjectKeyboardList.Card';

type Props = {
  className?: string;
  projectItems: IProjectKeyboardListProjectItem[];
  currentProjectKey: string;
  setCurrentProjectKey: (key: string) => void;
};

export const ProjectKeyboardList: FC<Props> = ({
  className,
  projectItems,
  currentProjectKey,
  setCurrentProjectKey,
}) => {
  return (
    <div css={style} className={className}>
      {projectItems.map((item) => (
        <ProjectKeyboardListCard
          key={item.projectKey}
          project={item}
          isCurrent={item.projectKey === currentProjectKey}
          setCurrent={() => setCurrentProjectKey(item.projectKey)}
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
  overflow-y: auto;
`;
