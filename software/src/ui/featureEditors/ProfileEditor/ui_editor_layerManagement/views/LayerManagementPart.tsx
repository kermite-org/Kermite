import { jsx, css, FC } from 'alumina';
import { texts } from '~/ui/base';
import { LayerOperationButton } from '~/ui/elements';
import { ILayerManagementPartViewModel } from '~/ui/featureEditors/ProfileEditor/ui_editor_layerManagement/viewModels/LayersManagementPartViewModel';

type Props = {
  vm: ILayerManagementPartViewModel;
};

export const LayerManagementPart: FC<Props> = ({
  vm: {
    canEdit,
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
    <LayerOperationButton
      icon="fa fa-plus"
      enabled={canEdit}
      handler={addNewLayer}
      hint={texts.hint_assigner_layerOps_addNewLayer}
    />
    <LayerOperationButton
      icon="fa fa-pen-square"
      enabled={canEdit}
      handler={editCurrentLayer}
      hint={texts.hint_assigner_layerOps_editLayerProperties}
    />
    <LayerOperationButton
      icon="fa fa-times"
      enabled={canEdit && canDeleteCurrentLayer}
      handler={deleteCurrentLayer}
      hint={texts.hint_assigner_layerOps_deleteLayer}
    />
    <LayerOperationButton
      icon="fa fa-long-arrow-alt-up"
      enabled={canEdit && canShiftForwardCurrentLayer}
      handler={shiftForwardCurrentLayer}
      hint={texts.hint_assigner_layerOps_bringForward}
    />
    <LayerOperationButton
      icon="fa fa-long-arrow-alt-down"
      enabled={canEdit && canShiftBackCurrentLayer}
      handler={shiftBackCurrentLayer}
      hint={texts.hint_assigner_layerOps_bringBackward}
    />
  </div>
);

const style = css`
  display: flex;
  gap: 4px;
`;
