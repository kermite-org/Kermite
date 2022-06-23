import { AluminaNode, css, FC, jsx } from 'alumina';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { ProjectKeyboardListCard } from '~/ui/fabrics/projectKeyboardList/ProjectKeyboardList.Card';

type Props = {
  projectItems: IProjectKeyboardListProjectItem[];
  currentProjectKey: string;
  setCurrentProjectKey: (key: string) => void;
  renderAdditionalItem?: () => AluminaNode;
};

export const ProjectKeyboardList: FC<Props> = ({
  projectItems,
  currentProjectKey,
  setCurrentProjectKey,
  renderAdditionalItem,
}) => {
  return (
    <div class={style}>
      {projectItems.map((item) => (
        <ProjectKeyboardListCard
          key={item.projectKey}
          project={item}
          isCurrent={item.projectKey === currentProjectKey}
          setCurrent={() => setCurrentProjectKey(item.projectKey)}
        />
      ))}
      {renderAdditionalItem?.()}
    </div>
  );
};

const style = css`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background: #ccc;
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;
`;
