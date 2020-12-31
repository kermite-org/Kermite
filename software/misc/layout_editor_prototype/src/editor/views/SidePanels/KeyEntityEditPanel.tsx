import { css } from 'goober';
import { useKeyEntityEditPanelModel } from '~/editor/views/SidePanels/KeyEntityEditPanel.model';
import { h } from '~/qx';
import { DesignAttributeTextInputRow } from './editRows/DesignAttributeTextInputRow';

const cssKeyEntityEditPanel = css`
  padding: 10px;
  label {
    display: inline-block;
    width: 80px;
  }
  input {
    width: 60px;
  }

  > .content {
    margin-left: 10px;

    > .errorZone {
      > .errorText {
        color: red;
      }
    }
  }
`;

export const KeyEntityEditPanel = () => {
  const vm = useKeyEntityEditPanelModel().keyEntityAttrsVm;
  return (
    <div css={cssKeyEntityEditPanel}>
      <div>key properties</div>
      <div class="content">
        <div className="editZone">
          {vm.slots.map((slot) => (
            <DesignAttributeTextInputRow key={slot.propKey} model={slot} />
          ))}
        </div>
        <div qxIf={!!vm.errorText} className="errorZone">
          <span className="errorText">{vm.errorText}</span>
        </div>
      </div>
    </div>
  );
};
