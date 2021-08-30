import { css, FC, jsx } from 'qx';
import {
  GeneralButtonMenu,
  ProjectKeyboardList,
  RadioButtonLine,
  RibbonSelector,
} from '~/ui/components';
import { useProjectManagementMenuModel } from '~/ui/features/ProjectSelectionPart/models/ProjectManagementMenuModel';
import { useProjectSelectionPartModel } from '~/ui/features/ProjectSelectionPart/models/ProjectSelectionPartModel';

export const ProjectSelectionPart: FC = () => {
  const {
    sourceProjectItems,
    projectKey,
    setProjectKey,
    canSelectResourceOrigin,
    resourceOriginSelectorSource,
    isMenuButtonVisible,
  } = useProjectSelectionPartModel();
  const { menuItems } = useProjectManagementMenuModel();
  return (
    <div css={style}>
      <div className="top-row">
        <GeneralButtonMenu menuItems={menuItems} qxIf={isMenuButtonVisible} />
        <div qxIf={!isMenuButtonVisible} />
        <RibbonSelector
          {...resourceOriginSelectorSource}
          qxIf={canSelectResourceOrigin}
        />
      </div>
      <ProjectKeyboardList
        className="keyboard-list"
        projectItems={sourceProjectItems}
        currentProjectKey={projectKey}
        setCurrentProjectKey={setProjectKey}
      />
      <div className="bottom-row">
        <RadioButtonLine
          checked={projectKey === ''}
          onClick={() => setProjectKey('')}
          text="各画面で選択する"
        />
      </div>
    </div>
  );
};

const style = css`
  margin-top: 10px;

  > .top-row {
    display: flex;
    justify-content: space-between;
  }

  > .keyboard-list {
    margin-top: 10px;
    max-height: 600px;
  }

  > .bottom-row {
    margin-top: 10px;
  }
`;
