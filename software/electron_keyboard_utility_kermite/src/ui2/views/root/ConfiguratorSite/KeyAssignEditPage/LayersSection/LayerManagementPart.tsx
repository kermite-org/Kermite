import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { LayerManagementPartViewModel } from './LayerManagementPart.model';
import { uiTheme } from '~ui2/models/UiTheme';

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
    color: ${uiTheme.colors.clMainText};
  `;
  return (
    <div css={cssButton} onClick={props.handler} data-disabled={!props.enabled}>
      <i className={props.icon} />
    </div>
  );
};

export const LayerManagementPart = () => {
  const cssButtonsRow = css`
    display: flex;
  `;

  const layerManagementPartViewModel = new LayerManagementPartViewModel();

  return () => {
    const {
      canModifyCurrentLayer,
      canShiftBackCurrentLayer,
      canShiftForwardCurrentLayer,
      shiftBackCurrentLayer,
      shiftForwardCurrentLayer,
      editCurrentLayer,
      deleteCurrentLayer,
      addNewLayer
    } = layerManagementPartViewModel;

    return (
      <div css={cssButtonsRow}>
        <LayerOperationButtton
          icon="fa fa-plus"
          enabled={true}
          handler={addNewLayer}
          qxOptimizer="deepEqual"
        />
        <LayerOperationButtton
          icon="fa fa-pen-square"
          enabled={canModifyCurrentLayer}
          handler={editCurrentLayer}
          qxOptimizer="deepEqual"
        />
        <LayerOperationButtton
          icon="fa fa-times"
          enabled={canModifyCurrentLayer}
          handler={deleteCurrentLayer}
          qxOptimizer="deepEqual"
        />

        <LayerOperationButtton
          icon="fa fa-long-arrow-alt-up"
          enabled={canShiftBackCurrentLayer}
          handler={shiftBackCurrentLayer}
          qxOptimizer="deepEqual"
        />
        <LayerOperationButtton
          icon="fa fa-long-arrow-alt-down"
          enabled={canShiftForwardCurrentLayer}
          handler={shiftForwardCurrentLayer}
          qxOptimizer="deepEqual"
        />
      </div>
    );
  };
};
