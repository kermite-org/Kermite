import { jsx, css, FC } from 'qx';
import { uiTheme } from '~/ui/base';
import {
  OperationButtonWithIcon,
  ProjectAttachmentFileSelectorModal,
} from '~/ui/components';
import { RadioButtonLine } from '~/ui/components/molecules/RadioButtonLine';
import { LayoutManagerMenu } from '~/ui/pages/layouter-page/LayoutManagerMenu';
import { layoutManagerRootModel } from '~/ui/pages/layouter-page/models/LayoutManagerBase';
import { useLayoutManagerTopBarModel } from '~/ui/pages/layouter-page/models/LayoutManagerTopBarModel';
import { makeProjectLayoutSelectorModalModel } from '~/ui/pages/layouter-page/models/ProjectLayoutSelectorModalModel';

export const LayoutManagerTopBar: FC = () => {
  layoutManagerRootModel.updateBeforeRender();
  const modalModel = makeProjectLayoutSelectorModalModel();

  const {
    editTargetRadioSelection,
    setEditTargetRadioSelection,
    canEditCurrentProfile,
    editSourceText,
    canOverwrite,
    overwriteLayout,
  } = useLayoutManagerTopBarModel();
  return (
    <div css={style}>
      <div className="first-row">
        Edit Target
        <RadioButtonLine
          text="Current Profile"
          checked={editTargetRadioSelection === 'CurrentProfile'}
          onClick={() => setEditTargetRadioSelection('CurrentProfile')}
          radioGroupName="radio_group_edit_target_selection"
          disabled={!canEditCurrentProfile}
        />
        <RadioButtonLine
          text="Layout File"
          checked={editTargetRadioSelection === 'LayoutFile'}
          onClick={() => setEditTargetRadioSelection('LayoutFile')}
          radioGroupName="radio_group_edit_target_selection"
        />
      </div>
      <div
        className="second-row"
        qxIf={editTargetRadioSelection === 'LayoutFile'}
      >
        <LayoutManagerMenu />
        <div class="targetDisplayArea">{editSourceText}</div>
        <OperationButtonWithIcon
          icon="save"
          label="save"
          disabled={!canOverwrite}
          onClick={overwriteLayout}
        />
      </div>
      {modalModel && <ProjectAttachmentFileSelectorModal vm={modalModel} />}
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
