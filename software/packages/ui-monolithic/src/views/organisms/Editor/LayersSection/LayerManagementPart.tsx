import { css } from 'goober';
import { ILayerManagementPartViewModel } from '~ui/viewModels/Editor/LayersManagementPartViewModel';
import { LayerOperationButtton } from '~ui/views/elements/LayerOperationButtton';
import { h } from '~qx';

export const LayerManagementPart = (props: {
  vm: ILayerManagementPartViewModel;
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
    canDeleteCurrentLayer,
  } = props.vm;

  return (
    <div css={cssButtonsRow}>
      <LayerOperationButtton
        icon="fa fa-plus"
        enabled={true}
        handler={addNewLayer}
      />
      <LayerOperationButtton
        icon="fa fa-pen-square"
        enabled={true}
        handler={editCurrentLayer}
      />
      <LayerOperationButtton
        icon="fa fa-times"
        enabled={canDeleteCurrentLayer}
        handler={deleteCurrentLayer}
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
