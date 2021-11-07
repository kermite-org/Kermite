import { css, FC, jsx } from 'qx';
import {
  IGeneralMenuItem,
  IProjectKeyboardListProjectItem,
  ISelectorSource,
} from '~/ui/base';
import {
  GeneralButtonMenu,
  RadioButtonLine,
  RibbonSelector,
} from '~/ui/components';
import { ProjectKeyboardList } from '~/ui/fabrics/ProjectKeyboardList/ProjectKeyboardList';

type Props = {
  sourceProjectItems: IProjectKeyboardListProjectItem[];
  projectKey: string;
  setProjectKey(projectKey: string): void;
  canSelectResourceOrigin: boolean;
  resourceOriginSelectorSource: ISelectorSource;
  isMenuButtonVisible: boolean;
  menuItems: IGeneralMenuItem[];
};

export const ProjectSelectionPartComponent: FC<Props> = ({
  sourceProjectItems,
  projectKey,
  setProjectKey,
  canSelectResourceOrigin,
  resourceOriginSelectorSource,
  isMenuButtonVisible,
  menuItems,
}) => (
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

const style = css`
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
