import { jsx, css, FC } from 'qx';
import { texts } from '~/ui/base';
import { LayerOperationButtton } from '~/ui/components';
import { ILayerManagementPartViewModel } from '~/ui/pages/editor-page/ui_editor_layerManagement/viewModels/LayersManagementPartViewModel';

type Props = {
  vm: ILayerManagementPartViewModel;
};

export const LayerManagementPart: FC<Props> = ({
  vm: {
    canShiftBackCurrentLayer,
    canShiftForwardCurrentLayer,
    shiftBackCurrentLayer,
    shiftForwardCurrentLayer,
    editCurrentLayer,
    deleteCurrentLayer,
    addNewLayer,
    canDeleteCurrentLayer,
  },
}) => (
  <div css={style}>
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

const style = css`
  display: flex;
`;
