import { css, FC, jsx } from 'alumina';
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
  canSelectResourceOrigin?: boolean;
  resourceOriginSelectorSource?: ISelectorSource;
  isMenuButtonVisible?: boolean;
  menuItems?: IGeneralMenuItem[];
  showNoSelectionOption?: boolean;
};

export const ProjectSelectionPartComponent: FC<Props> = ({
  sourceProjectItems,
  projectKey,
  setProjectKey,
  canSelectResourceOrigin,
  resourceOriginSelectorSource,
  isMenuButtonVisible,
  menuItems,
  showNoSelectionOption,
}) => (
  <div class={style}>
    <div class="top-row">
      {isMenuButtonVisible && menuItems && (
        <GeneralButtonMenu menuItems={menuItems} />
      )}
      <div if={!isMenuButtonVisible} />
      {canSelectResourceOrigin && resourceOriginSelectorSource && (
        <RibbonSelector {...resourceOriginSelectorSource} />
      )}
    </div>
    <ProjectKeyboardList
      class="keyboard-list"
      projectItems={sourceProjectItems}
      currentProjectKey={projectKey}
      setCurrentProjectKey={setProjectKey}
    />
    <div class="bottom-row" if={showNoSelectionOption}>
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
    display: flex;
  }
`;
