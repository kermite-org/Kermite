import { css } from 'goober';
import { editorModel } from '~models/AppModel';
import { hx } from '~views/basis/qx';

const LayerOperationButtton = (props: {
  icon: string;
  handler: () => void;
  enabled: boolean;
}) => {
  const cssButton = css`
    font-size: 16px;
    width: 26px;
    height: 26px;
    cursor: pointer;
    &:hover {
      background: #234;
    }
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 4px;

    &[data-disabled] {
      opacity: 0.3;
      pointer-events: none;
    }
    color: #fff;
  `;
  return (
    <div css={cssButton} onClick={props.handler} data-disabled={!props.enabled}>
      <i class={props.icon} />
    </div>
  );
};

export const LayerOperationButtonsPart = () => {
  const cssButtonsRow = css`
    display: flex;
  `;

  const {
    canModifyCurrentLayer,
    canShiftBackCurrentLayer,
    canShiftForwardCurrentLayer,
    shiftBackCurrentLayer,
    shiftForwardCurrentLayer,
    renameCurrentLayer,
    deleteCurrentLayer,
    addNewLayer,
  } = editorModel.layerManagementModel;

  return (
    <div css={cssButtonsRow}>
      <LayerOperationButtton
        icon="fa fa-plus"
        enabled={true}
        handler={addNewLayer}
      />
      <LayerOperationButtton
        icon="fa fa-times"
        enabled={canModifyCurrentLayer}
        handler={deleteCurrentLayer}
      />
      <LayerOperationButtton
        icon="fa fa-pen-square"
        enabled={canModifyCurrentLayer}
        handler={renameCurrentLayer}
      />
      <LayerOperationButtton
        icon="fa fa-long-arrow-alt-up"
        enabled={canShiftBackCurrentLayer}
        handler={shiftBackCurrentLayer}
      />
      <LayerOperationButtton
        icon="fa fa-long-arrow-alt-down"
        enabled={canShiftForwardCurrentLayer}
        handler={shiftForwardCurrentLayer}
      />
    </div>
  );
};
