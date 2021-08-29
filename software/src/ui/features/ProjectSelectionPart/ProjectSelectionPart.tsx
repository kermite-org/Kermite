import { css, FC, jsx } from 'qx';
import { IGeneralMenuItem } from '~/ui/base';
import {
  RibbonSelector,
  ProjectKeyboardList,
  RadioButtonLine,
  GeneralButtonMenu,
} from '~/ui/components';
import { useProjectSelectionPartModel } from './ProjectSelectionPart.model';

const menuItems: IGeneralMenuItem[] = [
  {
    type: 'menuEntry',
    text: 'create new',
    handler: () => {},
    disabled: true,
  },
  {
    type: 'menuEntry',
    text: 'copy from online project',
    handler: () => {},
  },
  {
    type: 'menuEntry',
    text: 'rename',
    handler: () => {},
    disabled: true,
  },
  {
    type: 'menuEntry',
    text: 'delete',
    handler: () => {},
    disabled: true,
  },
  {
    type: 'menuEntry',
    text: 'open data folder',
    handler: () => {},
    disabled: true,
  },
];

export const ProjectSelectionPart: FC = () => {
  const {
    sourceProjectItems,
    projectKey,
    setProjectKey,
    canSelectResourceOrigin,
    resourceOriginSelectorSource,
    isMenuActive,
  } = useProjectSelectionPartModel();
  return (
    <div css={style}>
      <div className="top-row">
        <GeneralButtonMenu menuItems={menuItems} qxIf={isMenuActive} />
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
