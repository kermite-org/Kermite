import { css, FC, jsx } from 'alumina';
import { colors, IGeneralMenuItem } from '~/ui/base';
import { GeneralButtonMenu, OperationButtonWithIcon } from '~/ui/components';
import { RadioButtonLine } from '~/ui/components/molecules/RadioButtonLine';
import { ILayoutManagerEditTarget } from '~/ui/pages/layoutEditorPage/models/layoutManagerBase';

type Props = {
  menuItems: IGeneralMenuItem[];
  canEditCurrentProfile: boolean;
  editTargetRadioSelection: ILayoutManagerEditTarget;
  setEditTargetRadioSelection(value: ILayoutManagerEditTarget): void;
  editSourceText: string;
  canOverwrite: boolean;
  overwriteLayout(): void;
  saveButtonVisible: boolean;
};

export const LayoutManagerTopBar: FC<Props> = ({
  menuItems,
  canEditCurrentProfile,
  editTargetRadioSelection,
  setEditTargetRadioSelection,
  editSourceText,
  canOverwrite,
  overwriteLayout,
  saveButtonVisible,
}) => {
  return (
    <div class={style}>
      <div class="first-row">
        Edit Target
        <RadioButtonLine
          text="Current Profile Layout"
          checked={editTargetRadioSelection === 'CurrentProfile'}
          onClick={() => setEditTargetRadioSelection('CurrentProfile')}
          radioGroupName="radio_group_edit_target_selection"
          disabled={!canEditCurrentProfile}
        />
        <RadioButtonLine
          text="Individual Layout"
          checked={editTargetRadioSelection === 'LayoutFile'}
          onClick={() => setEditTargetRadioSelection('LayoutFile')}
          radioGroupName="radio_group_edit_target_selection"
        />
      </div>
      <div class="second-row">
        <GeneralButtonMenu menuItems={menuItems} />
        <div class="targetDisplayArea">{editSourceText}</div>
        <OperationButtonWithIcon
          icon="save"
          label="save"
          disabled={!canOverwrite}
          onClick={overwriteLayout}
          if={saveButtonVisible}
        />
      </div>
    </div>
  );
};

const style = css`
  color: ${colors.clMainText};

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
      border: solid 1px ${colors.clPrimary};
      display: flex;
      align-items: center;
      padding: 0 5px;
    }
  }
`;
