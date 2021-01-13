import { uiTheme } from '@ui-layouter/base';
import { editMutations, editReader } from '@ui-layouter/editor/store';
import { GeneralConfigTextEditRow } from '@ui-layouter/editor/views/SidePanels/controls/GeneralConfigTextEditRow';
import { useTransGroupEditPanelModel } from '@ui-layouter/editor/views/SidePanels/models/TransGroupEditPanel.model';
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
`;

const cssTransGroupListItemCard = css`
  cursor: pointer;
  &[data-active] {
    background: ${uiTheme.colors.primaryWeaken};
  }
`;

export const TransGroupEditPanel = () => {
  const { allTransGroups } = editReader;
  const { vmX, vmY, vmAngle } = useTransGroupEditPanelModel();
  return (
    <div css={cssSightEditPanel}>
      <div>transformation groups</div>
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
        <div>
          {allTransGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => editMutations.setCurrentTransGroupById(group.id)}
              data-active={editReader.currentTransGroupId === group.id}
              css={cssTransGroupListItemCard}
            >
              {group.groupId}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
