import { FC, css, jsx } from 'alumina';
import { texts } from '~/app-shared';
import { LayerOperationButton } from '~/fe-shared';
import { ILayerManagementPartViewModel } from '../viewModels/layersManagementPartViewModel';

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
    canAddNewLayer,
    addNewLayer,
    canDeleteCurrentLayer,
    deleteCurrentLayer,
  },
}) => (
  <div class={style}>
    <LayerOperationButton
      icon="fa fa-plus"
      enabled={canAddNewLayer}
      handler={addNewLayer}
      hint={texts.assignerLayerOpsHint.addNewLayer}
    />
    <LayerOperationButton
      icon="fa fa-pen-square"
      enabled={canEdit}
      handler={editCurrentLayer}
      hint={texts.assignerLayerOpsHint.editLayerProperties}
    />
    <LayerOperationButton
      icon="fa fa-times"
      enabled={canEdit && canDeleteCurrentLayer}
      handler={deleteCurrentLayer}
      hint={texts.assignerLayerOpsHint.deleteLayer}
    />
    <LayerOperationButton
      icon="fa fa-long-arrow-alt-up"
      enabled={canEdit && canShiftForwardCurrentLayer}
      handler={shiftForwardCurrentLayer}
      hint={texts.assignerLayerOpsHint.bringForward}
    />
    <LayerOperationButton
      icon="fa fa-long-arrow-alt-down"
      enabled={canEdit && canShiftBackCurrentLayer}
      handler={shiftBackCurrentLayer}
      hint={texts.assignerLayerOpsHint.bringBackward}
    />
  </div>
);

const style = css`
  display: flex;
  gap: 4px;
`;
