import { css, FC, jsx } from 'qx';
import {
  ProjectKeyboardList,
  RadioButtonLine,
  RibbonSelector,
} from '~/ui/components';
import { ProjectManagementMenu } from '~/ui/features/ProjectSelectionPart/ProjectManagementMenu';
import { useProjectManagementMenuModel } from '~/ui/features/ProjectSelectionPart/ProjectManagementMenu.model';
import { useProjectSelectionPartModel } from './ProjectSelectionPart.model';

export const ProjectSelectionPart: FC = () => {
  const {
    sourceProjectItems,
    projectKey,
    setProjectKey,
    canSelectResourceOrigin,
    resourceOriginSelectorSource,
    isMenuActive,
  } = useProjectSelectionPartModel();
  const menuModel = useProjectManagementMenuModel();
  return (
    <div css={style}>
      <div className="top-row">
        <ProjectManagementMenu model={menuModel} qxIf={isMenuActive} />
        <div qxIf={!isMenuActive} />
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
