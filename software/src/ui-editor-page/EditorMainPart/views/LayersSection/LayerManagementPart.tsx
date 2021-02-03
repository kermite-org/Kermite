import { css } from 'goober';
import { h } from 'qx';
import { ILayerManagementPartViewModel } from '~/ui-editor-page/EditorMainPart/viewModels/LayersManagementPartViewModel';
import { LayerOperationButtton } from '~/ui-editor-page/components/elements/LayerOperationButtton';

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