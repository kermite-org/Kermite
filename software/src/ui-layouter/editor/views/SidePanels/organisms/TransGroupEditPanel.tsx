import { GeneralConfigTextEditRow } from '@ui-layouter/editor/views/SidePanels/controls/GeneralConfigTextEditRow';
import { useTransGroupEditPanelModel } from '@ui-layouter/editor/views/SidePanels/models/TransGroupEditPanel.model';
import { TransGroupListPart } from '@ui-layouter/editor/views/SidePanels/organisms/TransGroupListPart';
import { css } from 'goober';
import { h } from 'qx';

const cssSightEditPanel = css`
  padding: 10px;

  > .content {
    padding-left: 10px;

    > * + * {
      margin-top: 4px;
    }
  }

  > .groupsRow {
    margin-top: 5px;
  }
`;

export const TransGroupEditPanel = () => {
  const { vmX, vmY, vmAngle, currentGroupId } = useTransGroupEditPanelModel();
  return (
    <div css={cssSightEditPanel}>
      <div>transformation group {currentGroupId} </div>
      <div class="content">
        <GeneralConfigTextEditRow
          {...vmX}
          label={'x'}
          labelWidth={70}
          inputWidth={60}
          unit="mm"
        />
        <GeneralConfigTextEditRow
          {...vmY}
          label={'y'}
          labelWidth={70}
          inputWidth={60}
          unit="mm"
        />
        <GeneralConfigTextEditRow
          {...vmAngle}
          label={'angle'}
          labelWidth={70}
          inputWidth={60}
          unit="deg"
        />
      </div>
      <div className="groupsRow">
        <TransGroupListPart />
      </div>
    </div>
  );
};
