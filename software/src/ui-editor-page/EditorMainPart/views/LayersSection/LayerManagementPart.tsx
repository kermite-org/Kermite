import { css, jsx } from 'qx';
import { texts } from '~/ui-common';
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
        hint={texts.hintLayersAddNewLayer}
      />
      <LayerOperationButtton
        icon="fa fa-pen-square"
        enabled={true}
        handler={editCurrentLayer}
        hint={texts.hintLayersEditLayerProperties}
      />
      <LayerOperationButtton
        icon="fa fa-times"
        enabled={canDeleteCurrentLayer}
        handler={deleteCurrentLayer}
        hint={texts.hintLayersDeleteLayer}
      />
      <LayerOperationButtton
        icon="fa fa-long-arrow-alt-up"
        enabled={canShiftForwardCurrentLayer}
        handler={shiftForwardCurrentLayer}
        hint={texts.hintLayersBringForward}
      />
      <LayerOperationButtton
        icon="fa fa-long-arrow-alt-down"
        enabled={canShiftBackCurrentLayer}
        handler={shiftBackCurrentLayer}
        hint={texts.hintLayersBringBackward}
      />
    </div>
  );
};
