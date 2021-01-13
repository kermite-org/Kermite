import { GeneralConfigTextEditRow } from '@ui-layouter/editor/views/SidePanels/controls/GeneralConfigTextEditRow';
import { useKeyEntityEditPanelModel } from '@ui-layouter/editor/views/SidePanels/models/KeyEntityEditPanel.model';
import { css } from 'goober';
import { h } from 'qx';

const cssKeyEntityEditPanel = css`
  padding: 10px;
  > .content {
    margin-left: 10px;

    > .editZone {
      > * + * {
        margin-top: 4px;
      }
    }

    > .errorZone {
      > .errorText {
        color: red;
        font-size: 14px;
      }
    }
  }
`;

export const KeyEntityEditPanel = () => {
  const { keyEntityAttrsVm: vm } = useKeyEntityEditPanelModel();
  return (
    <div css={cssKeyEntityEditPanel}>
      <div>key properties</div>
      <div class="content">
        <div className="editZone">
          {vm.slots.map((slot, index) => (
            <GeneralConfigTextEditRow
              key={index}
              {...slot}
              labelWidth={80}
              inputWidth={60}
            />
          ))}
        </div>
        <div qxIf={!!vm.errorText} className="errorZone">
          <span className="errorText">{vm.errorText}</span>
        </div>
      </div>
    </div>
  );
};
