import { jsx, css, FC } from 'qx';
import { uiTheme } from '~/ui/base';
import {
  OperationButtonWithIcon,
  ProjectAttachmentFileSelectorModal,
} from '~/ui/components';
import { RadioButtonLine } from '~/ui/components/molecules/RadioButtonLine';
import { LayoutManagerMenu } from '~/ui/pages/layouter-page/LayoutManagerMenu';
import { useLayoutManagerViewModel } from '~/ui/pages/layouter-page/LayoutManagerViewModel';
import { makeLayoutSelectorModalViewModel } from '~/ui/pages/layouter-page/ProjectLayoutSelectorModalViewModel';

export const LayoutManagerTopBar: FC = () => {
  const vm = useLayoutManagerViewModel();
  const modalVm = makeLayoutSelectorModalViewModel(vm);

  return (
    <div css={style}>
      <div className="first-row">
        Edit Target
        <RadioButtonLine
          text="Current Profile"
          checked={vm.editTargetRadioSelection === 'CurrentProfile'}
          onClick={() => vm.setEditTargetRadioSelection('CurrentProfile')}
          radioGroupName="radio_group_edit_target_selection"
        />
        <RadioButtonLine
          text="Layout File"
          checked={vm.editTargetRadioSelection === 'LayoutFile'}
          onClick={() => vm.setEditTargetRadioSelection('LayoutFile')}
          radioGroupName="radio_group_edit_target_selection"
        />
      </div>
      <div
        className="second-row"
        qxIf={vm.editTargetRadioSelection === 'LayoutFile'}
      >
        <LayoutManagerMenu baseVm={vm} />
        <div class="targetDisplayArea">{vm.editSourceText}</div>
        <OperationButtonWithIcon
          icon="save"
          label="save"
          disabled={!vm.canOverwrite}
          onClick={vm.overwriteLayout}
        />
      </div>
      {modalVm && <ProjectAttachmentFileSelectorModal vm={modalVm} />}
    </div>
  );
};

const style = css`
  color: ${uiTheme.colors.clMainText};

  padding: 6px;
  padding-bottom: 0;
  gap: 0 4px;

  > .first-row {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 2px 0;
  }

  > .second-row {
    margin-top: 4px;
    display: flex;

    > * {
      flex-shrink: 0;
    }

    > .targetDisplayArea {
      flex-grow: 1;
      border: solid 1px ${uiTheme.colors.clPrimary};
      display: flex;
      align-items: center;
      padding: 0 5px;
    }
  }
`;
