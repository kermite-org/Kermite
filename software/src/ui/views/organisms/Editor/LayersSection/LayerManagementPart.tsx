import { css } from 'goober';
import { h } from '~lib/qx';
import { LayerManagementPartViewModel } from '~ui/viewModels/Editor/LayersOperationPartViewModel';
import { LayerOperationButtton } from '~ui/views/elements/LayerOperationButtton';

export const LayerManagementPart = (props: {
  vm: LayerManagementPartViewModel;
}) => {
  const cssButtonsRow = css`
    display: flex;
  `;

  const {
    canShiftBackCurrentLayer,
    canShiftForwardCurrentLayer,
    shiftBackCurrentLayer,
    shiftForwardCurrentLayer,
    editCurrentLayer,
    deleteCurrentLayer,
    addNewLayer,
    canDeleteCurrentLayer
  } = props.vm;

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
        enabled={true}
        handler={editCurrentLayer}
        qxOptimizer="deepEqual"
      />
      <LayerOperationButtton
        icon="fa fa-times"
        enabled={canDeleteCurrentLayer}
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
