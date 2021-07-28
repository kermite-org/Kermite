import { jsx, css } from 'qx';
import { texts } from '~/ui/base';
import { LayerOperationButtton } from '~/ui/components_editor';
import { ILayerManagementPartViewModel } from '~/ui/pages/editor-page/ui_editor_layerManagement/viewModels/LayersManagementPartViewModel';

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
        hint={texts.hint_assigner_layerOps_addNewLayer}
      />
      <LayerOperationButtton
        icon="fa fa-pen-square"
        enabled={true}
        handler={editCurrentLayer}
        hint={texts.hint_assigner_layerOps_editLayerProperties}
      />
      <LayerOperationButtton
        icon="fa fa-times"
        enabled={canDeleteCurrentLayer}
        handler={deleteCurrentLayer}
        hint={texts.hint_assigner_layerOps_deleteLayer}
      />
      <LayerOperationButtton
        icon="fa fa-long-arrow-alt-up"
        enabled={canShiftForwardCurrentLayer}
        handler={shiftForwardCurrentLayer}
        hint={texts.hint_assigner_layerOps_bringForward}
      />
      <LayerOperationButtton
        icon="fa fa-long-arrow-alt-down"
        enabled={canShiftBackCurrentLayer}
        handler={shiftBackCurrentLayer}
        hint={texts.hint_assigner_layerOps_bringBackward}
      />
    </div>
  );
};
